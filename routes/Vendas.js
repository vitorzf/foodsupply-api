const express = require("express");
const controller = require("../controllers/venda.controller");
const guard = require("../modules/guard");

const router = express.Router();

router.get("/vendas", guard.auth, controller.listaVendas);

router.get("/vendas/:status_pedido", guard.auth, controller.listaVendas);

router.get("/venda/:venda_id", guard.auth, controller.dadosVenda);

router.put("/venda/:venda_id/confirmar", guard.auth, controller.confirmarVenda);

module.exports = router;