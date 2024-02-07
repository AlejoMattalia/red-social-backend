//Importaciones
const jwt = require("jwt-simple");
const moment = require("moment");
const libjwt = require("../services/jwt.js");
const secret = libjwt.secret;


//Funcion
exports.auth = (req, res, next) => {

  if(!req.headers.authorization){
    return res.status(403).json({
      status: "Error",
      message: "La petición no tiene cabecera de autenticación"
    })
  }

  //limpiar token
  let token = req.headers.authorization.replace(/['"]+/g, "")

  //decodificar token
  try{
    let payload = jwt.decode(token, secret)

    if(payload.exp <= moment().unix()){
      res.status(404).json({
        status: "Error",
        message: "Token expirado",
      })
    }
  
    req.user = payload;
    
  }catch(err){
    res.status(404).json({
      status: "Error",
      message: "Token invalido",
      err
    })
  }

  next();
}