const validator = require("validator");

const validate = (params) => {
  // Validación del nombre
  let name = !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: 20 }) &&
    validator.isAlpha(params.name, "es-ES");

  // Validación del apellido
  let surname = !validator.isEmpty(params.surname) &&
    validator.isLength(params.surname, { min: 3, max: 20 }) &&
    validator.isAlpha(params.surname, "es-ES");

  // Validación del apodo (nick)
  let nick = !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 3, max: 20 }) &&
    validator.isAlphanumeric(params.nick);

  // Validación del correo electrónico
  let email = !validator.isEmpty(params.email) &&
    validator.isEmail(params.email);

  // Validación de la contraseña
  let password = !validator.isEmpty(params.password) &&
    validator.isLength(params.password, { min: 6 });

  // Validación de la biografía
  if (params.bio) {
    let bio = !validator.isEmpty(params.bio) &&
      validator.isLength(params.bio, { max: 250 });

    if (!bio) {
      throw new Error("No se ha superado la validación");
    } else {
      console.log("Validación superada");
    }
  }

  // Comprobación de todas las validaciones
  if (!name || !surname || !nick || !email || !password ) {
    throw new Error("No se ha superado la validación");
  }
}

module.exports = {
  validate
}
