const express = require("express");
const controller = require("../controllers/produtoController");

const router = express.Router();

router.post("/produto", controller.cadastrarProduto);

router.put("/produto/:produto_id", controller.atualizarProduto);

router.get("/produto/unidades_medida", controller.listaUnidadesMedida);

router.get("/produto/categorias", controller.listaCategorias);

router.get("/produto", controller.listaTodosProdutos);

module.exports = router;