const express = require("express");
const controller = require("../app/controllers/usuario.controller");
const guard = require("../modules/guard");

const router = express.Router();

router.post("/usuarios/login", controller.login);

router.post("/usuarios/registro", controller.registro);

router.post("/usuarios/cadastrar_endereco", guard.auth, controller.cadastrarEndereco);

router.get("/usuarios/dados/:usuario_id", controller.dadosUsuario);

router.get("/usuarios/listar_enderecos", guard.auth, controller.listarEnderecosUsuario);

router.put("/usuarios/alterar_senha", guard.auth, controller.alterarSenhaUsuario);

router.put("/usuarios/endereco/:endereco_id", guard.auth, controller.alterarEndereco);

router.put("/usuarios/endereco_principal", guard.auth, controller.alterarEnderecoPrincipal);

router.put("/usuarios/salvar_token_mercado_pago", guard.auth, controller.salvarTokenMP);

module.exports = router;