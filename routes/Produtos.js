const express = require("express");
const controller = require("../controllers/produtoController");

const router = express.Router();

router.post("/produtos", controller.cadastrarProduto);

router.put("/produtos/:produto_id", controller.atualizarProduto);

router.put("/produtos/:produto_id/estoque", controller.atualizarDadosProduto);

router.put("/produtos/:produto_id/preco", controller.atualizarDadosProduto);

router.get("/produtos/unidades_medida", controller.listaUnidadesMedida);

router.get("/produtos/categorias", controller.listaCategorias);

router.get("/produtos", controller.listaTodosProdutos);

router.get("/produtos/vendedor/:vendedor_id", controller.listaProdutosVendedor);

module.exports = router;