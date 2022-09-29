const express = require("express");
const controller = require("../app/controllers/mercadopago.controller");

const router = express.Router();

router.post("/mercadopago", controller.callbackMP);
router.post("/mercadopago/pending", controller.callbackMP);
router.post("/mercadopago/success", controller.callbackMP);
router.post("/mercadopago/failure", controller.callbackMP);

module.exports = router;