const express = require("express");
const controller = require("../controllers/pedidoController");

const router = express.Router();

router.post("/pedidos", controller.inserirPedido);

router.get("/pedidos", controller.listaPedidos);

router.get("/pedidos/:status_pedido", controller.listaPedidos);

router.get("/pedido/:pedido_id", controller.dadosPedido);

module.exports = router;