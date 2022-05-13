const express = require("express");
const controller = require("../controllers/usuarioController");

const router = express.Router();

router.post("/usuario/login", controller.login);

router.post("/usuario/registro", controller.registro);

module.exports = router;