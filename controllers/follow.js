//Imprtaciones
const Follow = require("../models/Follow");
const User = require("../models/User");
const mongoosePagination = require("mongoose-pagination");
const followService = require("../services/followService")

//Acciones de prueba
const pruebaFollow = (req, res) => {
  res.status(200).json({
    message: "Mensaje desde el controllador follow.js",
  });
};

//Seguir a un usuario
const save = (req, res) => {
  const params = req.body;
  const identity = req.user;

  //Verificar si ya sigue al usuario
  Follow.findOne({ user: identity.id, followed: params.followed })
    .then((existingFollow) => {
      if (existingFollow) {
        return res.status(200).json({
          status: "Error",
          message: "Ya sigues a este usuario",
          existingFollow,
        });
      }

      //Craer follow
      const userToFollow = new Follow({
        user: identity.id,
        followed: params.followed,
      });

      // Guardar follow en la base de datos
      userToFollow
        .save()
        .then((follow) => {
          return res.status(200).json({
            status: "Success",
            message: "Comenzaste a seguir al usuario correctamente",
            identity,
            follow,
          });
        })
        .catch((err) => {
          return res.status(200).json({
            status: "Error",
            message: "Error, no pudiste seguir al usuario",
            err,
          });
        });
    })
    .catch((err) => {
      return res.status(200).json({
        status: "Error",
        message: "Error, no pudiste seguir al usuario",
        err,
      });
    });
};

//Dejar de seguir a un usuario
const unfollow = (req, res) => {
  //id usuario identificado
  const userId = req.user.id;
  //id usuario que sigo y quiero dejar de seguir
  const followedId = req.params.id;

  Follow.findOneAndDelete({
    user: userId,
    followed: followedId,
  })
    .then((follow) => {
      if (follow) {
        return res.status(200).json({
          status: "Success",
          message: "Dejaste de seguir al usuario correctamente",
        });
      } else {
        return res.status(404).json({
          status: "Error",
          message: "No se encontró la relación de seguimiento para eliminar",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        status: "Error",
        message: "No pudiste dejar de seguir al usuario",
        err,
      });
    });
};

//Listado de usuarios que un usuario sigue (Siguiendo)
const following = (req, res) => {
  let userId = req.user.id;
  let page = 1;

  if (req.params.id) userId = req.params.id;
  if (req.params.page) page = req.params.page;

  const itemsPerPage = 2;

  Follow.find({ user: userId })
  .populate("followed", "-password -role -__v -email")
  .then(async follows => {
    const total = follows.length;
    
    // Calcular totalPages en base al número total de follows y itemsPerPage
    const totalPages = Math.ceil(total / itemsPerPage);

    // Realizar la paginación usando el método slice para obtener solo la página actual
    const currentPageFollows = follows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    let followUserIds = await followService.followUserIds(req.user.id)

    return res.status(200).json({
      status: "Success",
      message: "Listado de usuarios a los que estoy siguiendo",
      total,
      totalPages,
      follows: currentPageFollows,
      user_following: followUserIds.following,
      user_follow_me: followUserIds.followers
    });
  })
  .catch(error => {
    return res.status(500).json({
      status: "Error",
      message: "Error, no puedes ver el listado de los usuarios",
      error
    });
  });
};

//Listado de usuario que lo siguen (Seguidores)
const followers = (req, res) => {
  let userId = req.user.id;
  let page = 1;

  if (req.params.id) userId = req.params.id;
  if (req.params.page) page = req.params.page;

  const itemsPerPage = 2;

  Follow.find({ followed: userId })
  .populate("user", "-password -role -__v -email")
  .then(async follows => {
    const total = follows.length;
    
    // Calcular totalPages en base al número total de follows y itemsPerPage
    const totalPages = Math.ceil(total / itemsPerPage);

    // Realizar la paginación usando el método slice para obtener solo la página actual
    const currentPageFollows = follows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    let followUserIds = await followService.followUserIds(req.user.id)

    return res.status(200).json({
      status: "Success",
      message: "Listado de usuarios a los que me siguen",
      total,
      totalPages,
      follows: currentPageFollows,
      user_following: followUserIds.following,
      user_follow_me: followUserIds.followers
    });
  })
  .catch(error => {
    return res.status(500).json({
      status: "Error",
      message: "Error, no puedes ver el listado de los usuarios",
      error
    });
  });
};

module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
