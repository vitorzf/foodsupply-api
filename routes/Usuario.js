const express = require("express");
const controller = require("../controllers/usuarioController");

const router = express.Router();

router.post("/login", controller.login);

router.post("/registro", controller.registro);

module.exports = router;