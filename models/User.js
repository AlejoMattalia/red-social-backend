const { Schema, model } = require("mongoose")

const userShema = Schema({
  name: {
    type: String,
    required: true,
    maxLength: 20
  },

  surname: {
    type: String,
    maxLength: 20
  },

  bio: String,

  nick: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-]+(.[\w-]+)*@([\w-]+.)+[a-zA-Z]{2,7}$/, 'Por favor, introduce un correo electrónico válido.'],
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "role_user"
  },

  image: {
    type: String,
    default: "default.png"
  },

  created_at: {
    type: Date,
    default: Date.now()
  }
})

module.exports = model("User", userShema, "users")