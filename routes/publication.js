//Importaciones
const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publication");
const check = require("../middlewares/auth");
const {uploadImagePublications} = require("../middlewares/uploadImagePublication");

//Definir rutas
router.get("/prueba_publication", publicationController.pruebaPublication);
router.post("/save", [check.auth, uploadImagePublications.single("file0")], publicationController.save);
router.get("/one_publication/:id", check.auth, publicationController.onePublication);
router.delete("/delete_publication/:id", check.auth, publicationController.deletePublication);
router.get("/publication_user/:id/:page?", check.auth, publicationController.publicationUser);
router.get("/publication/:file", check.auth, publicationController.publication);
router.get("/feed/:page?", check.auth, publicationController.feed)

//Exportar la ruta
module.exports = router;