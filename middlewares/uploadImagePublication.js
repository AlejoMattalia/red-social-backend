const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "./images/publications/")
  },

  filename: (req, file, cb) => {
    cb(null, "publications-"+Date.now()+"-"+file.originalname)
  }
})

exports.uploadImagePublications = multer({storage})
