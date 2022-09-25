const express = require("express");
const guard = require("../modules/guard");
const controller = require("../app/controllers/vendedor.controller");

const router = express.Router();

router.put("/vendedores/definir_nome", guard.auth, controller.definirNomeVendedor);

router.get("/vendedores", controller.buscaTodosVendedores);

module.exports = router;