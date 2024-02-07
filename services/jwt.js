//Importaciones
const jwt = require("jwt-simple");
const moment = require("moment");

const secret = "ee5b24bd601a0175321b477f7dfc8a2348b0ab8bbf00a5a44e2f40cfcd9c0e3cADAAsw23r434r";

const createToken = (user) => {

  const payload = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix()
  }

  return jwt.encode(payload, secret)
}

module.exports = {
  createToken,
  secret
}