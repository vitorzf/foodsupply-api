const express = require("express");
const controller = require("../app/controllers/produto.controller");
const guard = require("../modules/guard");

const router = express.Router();

router.post("/produtos", guard.auth, controller.cadastrarProduto);

router.put("/produtos/:produto_id", guard.auth, controller.atualizarProduto);

router.put("/produtos/:produto_id/estoque", guard.auth, controller.atualizarDadosProduto);

router.put("/produtos/:produto_id/preco", guard.auth, controller.atualizarDadosProduto);

router.get("/produtos/unidades_medida", controller.listaUnidadesMedida);

router.get("/produtos/categorias", guard.auth, controller.listaCategorias);

router.get("/produtos", guard.auth, controller.listaTodosProdutos);

router.get("/produtos/:produto_id", controller.listaDadosProdutos);

router.get("/produtos/vendedor/:vendedor_id", guard.auth, controller.listaProdutosVendedor);

module.exports = router;