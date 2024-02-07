//Importaciones
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const check = require("../middlewares/auth");
const { uploadImageAvatar } = require("../middlewares/uploadImageAvatar")



//Definir ruta
router.get("/prueba", check.auth, userController.pruebController);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", check.auth, userController.profile);
router.get("/list/:page?", check.auth, userController.list);
router.patch("/update", [check.auth, uploadImageAvatar.single("file0")], userController.update);
router.get("/avatar/:file", check.auth, userController.avatar);
router.get("/counter/:id", check.auth, userController.counter);


//Exportar la ruta
module.exports = router;