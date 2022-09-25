const express = require("express");
const controller = require("../controllers/pedido.controller");
const guard = require("../modules/guard");

const router = express.Router();

router.post("/pedidos", guard.auth, controller.inserirPedido);

router.get("/pedidos", guard.auth, controller.listaPedidos);

router.get("/pedidos/:status_pedido", guard.auth, controller.listaPedidos);

router.get("/pedido/:pedido_id", guard.auth, controller.dadosPedido);

router.put("/pedido/rejeitar_frete/:pedido_id", guard.auth, controller.rejeitarFrete);

router.post("/pedido/aceitar_frete/:pedido_id", guard.auth, controller.aceitarFrete);

module.exports = router;