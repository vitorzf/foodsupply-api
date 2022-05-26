const express = require("express");
const controller = require("../controllers/vendasController");

const router = express.Router();

router.post("/vendas", controller.inserirVenda);

module.exports = router;