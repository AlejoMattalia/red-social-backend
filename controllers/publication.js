const Publication = require("../models/Publication");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");

//Acciones de prueba
const pruebaPublication = (req, res) => {
  res.status(200).json({
    message: "Mensaje desde el controllador publication.js"
  })
}

//Guardar publicación
const save = (req, res) => {

  //guardar los datos del body
  const params = req.body;
  //usuario
  const userId = req.user.id

  let image;
  if (req.file) {
    const i = req.file.originalname;
    const imageSplit = i.split(".");
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
      image = req.file.filename;
    }
  } else {
    return res.status(200).json({
      status: "Error",
      message: "Debes subir una imagen"
    })
  }


  if (!params.text) {
    return res.status(400).json({
      status: "Error",
      message: "Debes enviar el texto de la publicación",
    })
  }

  //Crear y rellenar el objeto del modelo
  let newPublication = new Publication(params)
  newPublication.user = userId;
  newPublication.file = image

  //Guardar en la bbdd
  newPublication.save()
    .then((publication) => {
      return res.status(200).json({
        status: "Success",
        message: "Subiste la publicación correctamente",
        publication
      })
    })
    .catch((err) => {
      return res.status(500).json({
        status: "Error",
        message: "No pudiste subir la publicación",
      })
    })
}

//Mostrar una publicación
const onePublication = (req, res) => {
  //Obtener id de la url  
  const publicationId = req.params.id;

  Publication.findById(publicationId).exec()
    .then((publication) => {
      return res.status(200).json({
        status: "Success",
        message: "Viendo una publicación",
        publication
      })
    })
    .catch((err) => {
      return res.status(500).json({
        status: "Error",
        message: "No existe la publicación",
      })
    })
}

//Eliminar publicaciones
const deletePublication = (req, res) => {
  const publicationId = req.params.id;


  Publication.deleteOne({ "user": req.user.id, "_id": publicationId })
    .then((result) => {
      if (result.deletedCount > 0) {
        return res.status(200).json({
          status: "Success",
          message: "Eliminaste la publicación correctamente",
          publication: publicationId
        });
      } else {
        return res.status(404).json({
          status: "Error",
          message: "La publicación no fue encontrada o no tienes permisos para eliminarla",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        status: "Error",
        message: "No pudiste borrar la publicación",
      });
    });
}
//Listar publicaciones de un usuario
const publicationUser = (req, res) => {

  const userId = req.params.id;
  let page = 1;
  if (req.params.page) page = req.params.page;
  const itemsPerPage = 5;

  Publication.find({ "user": userId })
    .sort("-created_at")
    .populate("user", "-password -__v -role -email")
    .exec()
    .then((publications) => {

      if (publications.length <= 0) {
        return res.status(300).json({
          status: "Error",
          message: "El usuario no tiene publicaciones",
          publications
        })
      }

      const total = publications.length;
      const totalPages = Math.ceil(total / itemsPerPage);
      const currentPagePublication = publications.slice((page - 1) * itemsPerPage, page * itemsPerPage);


      return res.status(200).json({
        status: "Success",
        message: "Todas las publicaciones de un usuario",
        total,
        totalPages,
        publication: currentPagePublication,
      });
    })
    .catch(() => {
      return res.status(500).json({
        status: "Error",
        message: "No pudiste ver las publicaciones",
      });
    })

}


//Devolver archivo multimedia

const publication = (req, res) => {

  const file = req.params.file;
  const filePath = "./images/publications/" + file;

  fs.stat(filePath, (error, exists) => {

    if (exists) {
      return res.sendFile(path.resolve(filePath))
    } else {
      return res.status(400).json({
        status: "Error",
        message: "No existe la imagen"
      })
    }

  })

}


const feed = async (req, res) => {


  //Sacar la pag actual
  let page = 1;
  if (req.params.page) page = req.params.page;
  const itemsPerPage = 5;

  //Sacar un array de id que yo sigo como usuario
  const myFollow = await followService.followUserIds(req.user.id);

  //find a publicaciones 
  Publication.find({ "user": myFollow.following }).populate("user", "-password -role -__v -email").sort("-created_at")
    .then((publications) => {

      const total = publications.length;
      const totalPages = Math.ceil(total / itemsPerPage);
      const currentPagePublication = publications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

      return res.status(200).json({
        status: "Success",
        message: "Feed completo",
        following: myFollow.following,
        total,
        totalPages,
        publications: currentPagePublication
      })
    })
    .catch((error) => {
      return res.status(500).json({
        status: "Success",
        message: "No se ah listado las publicaciones del feed",
      })
    })
}


module.exports = {
  pruebaPublication,
  save,
  onePublication,
  deletePublication,
  publicationUser,
  publication,
  feed
}