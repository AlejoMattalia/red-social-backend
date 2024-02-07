//Importaciones
const User = require("../models/User");
const bcrypt = require("bcrypt")
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-pagination")
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
const Follow = require("../models/Follow");
const Publication = require("../models/Publication");
const {validate} = require("../helpers/validate");

//Acciones de prueba
const register = (req, res) => {

  let params = req.body

  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "Error",
      message: "Faltan parametros"
    })
  }

  //Validación avanzada
  try{
    validate(params)
  }catch(error){
    return res.status(400).json({
      status: "Error",
      message: "Validación no superada"
    })
  }

  User.find({
    $or: [
      { email: params.email.toLowerCase() },
      { nick: params.nick.toLowerCase() },
    ]
  })
    .exec()
    .then(async () => {

      //Cifrar contraseña
      let pwd = await bcrypt.hash(params.password, 10)
      params.password = pwd;

      let user_to_save = new User(params)

      //Guardar en la base de datos
      user_to_save.save()
        .then((user) => {
          //Token
          const token = jwt.createToken(user);

          return res.status(200).json({
            status: "Success",
            message: "Usuario registrado correctamente",
            user,
            token
          })
        })
        .catch((err) => {
          let messageError;
          let emailrepeat = err.keyValue.email;
          let nickrepeat = err.keyValue.nick;


          if (emailrepeat) {
            messageError = "El email ya existe"
          } else if (nickrepeat) {
            messageError = "El nombre de usuario ya existe"
          }
          else {
            messageError = "Error no pudiste iniciar sesión"
          }

          return res.status(500).json({
            status: "Error",
            message: "No pudiste registrate",
            messageError
          })
        })


    })
    .catch((user) => {
      res.status(400).json({
        status: "Error",
        message: "Error no pudiste registarte"
      })
    })
}


const login = (req, res) => {

  let params = req.body;

  if (!((params.email || params.nick) && params.password)) {
    return res.status(400).json({
      message: "Error, no pudiste iniciar sesión, faltan datos por enviar"
    })
  }

  User.findOne({ $or: [{ email: params.email }, { nick: params.nick }] })
    .exec()
    .then((user) => {

      if (user) {
        //Comparar contraseñas
        const pwd = bcrypt.compareSync(params.password, user.password);

        if (!pwd) {
          return res.status(404).json({
            status: "Error",
            message: "Contraseña incorrecta"
          })
        }

        //Token
        const token = jwt.createToken(user);


        //Devolver datos del usuario
        res.status(200).json({
          status: "Success",
          message: "Usuario registrado correctamente",
          pwd,
          user: {
            id: user.id,
            name: user.name,
            nick: user.nick
          },
          token
        });

      } else {
        res.status(404).json({
          status: "Error",
          message: "No existe el usuario"
        });
      }

    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        message: "Error, no pudiste iniciar sesión"
      });
    });
}


const pruebController = (req, res) => {

  res.status(200).json({
    status: "Success",
    message: "Prueba funcionando",
    user: req.user
  })

}


const profile = (req, res) => {

  const id = req.params.id;

  User.findById(id)
    .select({ password: 0, role: 0 })
    .exec()
    .then(async(user) => {

      const followInfo = await followService.followThisUser(req.user.id, id)

      res.status(200).json({
        message: "Datos del usuario",
        user,
        following: followInfo.following,
        follower: followInfo.followers
      })

    })
    .catch((err) => {

      res.status(404).json({
        status: "Error",
        message: "El usuario no existe o hubo algun error",
      })

    })
}


const list = (req, res) => {
  // Controlar qué página estamos
  let page = 1;
  if (req.params.page) {
    page = parseInt(req.params.page);
  }

  // Consulta mongoose pagination con skip y limit
  const itemsPerPage = 5;

  User.find()
    .select("-password -email -role -__v")
    .sort('_id')
    .skip((page - 1) * itemsPerPage)
    .limit(itemsPerPage)
    .then(async(users) => { 
  
      let followUserIds = await followService.followUserIds(req.user.id)

      // Obtener el total de usuarios
      User.countDocuments()
        .then((total) => {
          const totalPages = Math.ceil(total / itemsPerPage);
          return res.status(200).json({
            status: "Success",
            page,
            users,
            itemsPerPage,
            total,
            totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
          });
        })
        .catch(() => {
          return res.status(500).json({
            status: "Error",
            message: "Error al obtener el total de usuarios"
          });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(404).json({
        status: "Error",
        message: "No hay usuarios disponibles",
        err
      });
    });
};


const update = (req, res) => {
  let id = req.user.id;
  let userToUpdate = req.body;

  // Obtener imagen
  let imageUpdate;
  if (req.file) {
    const image = req.file.originalname;
    const imageSplit = image.split(".");
    const extension = imageSplit[1];

    if (extension !== "jpeg" && extension !== "jpg" &&
      extension !== "gif" && extension !== "png") {

      fs.unlink(req.file.path, (error) => {
        return res.status(400).json({
          status: "Error",
          message: `No puedes subir imágenes con la extensión ${extension}`
        });
      });
    } else {
      imageUpdate = req.file.filename;
    }
  }

  // Actualizar usuario y, opcionalmente, la imagen
  User.findById(id)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          status: "Error",
          message: "El usuario no existe",
        });
      }

      // Actualizar usuario
      return User.findOneAndUpdate({ _id: id }, userToUpdate, { new: true }).exec();
    })
    .then((userUpdate) => {
      // Actualizar imagen si está presente
      if (imageUpdate) {
        userUpdate.image = imageUpdate;
        return userUpdate.save();
      } else {
        return userUpdate;
      }
    })
    .then((finalUser) => {
      return res.status(200).json({
        StaticRange: "Success",
        message: "Usuario editado correctamente",
        user: {
          name: finalUser.name,
          surname: finalUser.surname,
          nick: finalUser.nick,
          email: finalUser.email,
          bio: finalUser.bio,
          image: finalUser.image
        }
      });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "Error",
        message: "Error no pudiste editar el usuario",
      });
    });
};


const avatar = (req, res) => {

  const file = req.params.file;
  const filePath = "./images/avatars/" + file;

  fs.stat(filePath, (error, exists)=>{

    console.log(exists)
    if(exists){
      return res.sendFile(path.resolve(filePath))
    }else{
      return res.status(400).json({
        status: "Error",
        message: "No existe la imagen"
      })
    }

  })
  
}


const counter = async(req, res) => {

  let userId = req.user.id;
  if (req.params.id) userId = req.params.id;
  
  try{

    const following = await Follow.countDocuments({"user": userId});
    const followers = await Follow.countDocuments({"followed": userId})
    const publications = await Publication.countDocuments({"user": userId})

    return res.status(200).json({
      status: "Success",
      message: "Contador",
      following,
      followers,
      publications
    });

  }catch(error){
    return res.status(500).json({
      status: "Error",
      message: "No pudiste ver el contador",
    });
  }
}


module.exports = {
  register,
  login,
  pruebController,
  profile,
  list,
  update,
  avatar,
  counter
}