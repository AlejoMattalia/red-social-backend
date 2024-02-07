const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "./images/avatars/")
  },

  filename: (req, file, cb) => {
    cb(null, "avatar-"+Date.now()+"-"+file.originalname)
  }
})

exports.uploadImageAvatar = multer({storage})
