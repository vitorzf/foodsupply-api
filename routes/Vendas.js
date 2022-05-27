const express = require("express");
const controller = require("../controllers/vendaController");

const router = express.Router();

router.get("/vendas", controller.listaVendas);

router.get("/vendas/:status_pedido", controller.listaVendas);

router.get("/venda/:venda_id", controller.dadosVenda);

router.put("/venda/:venda_id/confirmar", controller.confirmarVenda);

module.exports = router;