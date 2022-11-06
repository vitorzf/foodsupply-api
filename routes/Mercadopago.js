const express = require("express");
const controller = require("../app/controllers/mercadopago.controller");

const router = express.Router();

router.post("/mercadopago", controller.recebidoMP);
router.get("/mercadopago", controller.callbackMP);
router.get("/mercadopago/pending", controller.callbackMP);
router.get("/mercadopago/success", controller.callbackMP);
router.get("/mercadopago/failure", controller.callbackMP);

module.exports = router;