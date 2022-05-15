const express = require("express");
const controller = require("../controllers/vendedorController");

const router = express.Router();

router.put("/vendedores/definir_nome", controller.definirNomeVendedor);

router.get("/vendedores", controller.buscaTodosVendedores);

module.exports = router;