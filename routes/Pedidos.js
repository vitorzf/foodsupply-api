const express = require("express");
const controller = require("../controllers/pedidoController");

const router = express.Router();

router.post("/pedidos", controller.inserirPedido);

router.get("/pedidos", controller.listaPedidos);

router.get("/pedidos/:status_pedido", controller.listaPedidos);

router.get("/pedido/:pedido_id", controller.dadosPedido);

router.put("/pedido/rejeitar_frete/:pedido_id", controller.rejeitarFrete);

router.post("/pedido/aceitar_frete/:pedido_id", controller.aceitarFrete);

module.exports = router;