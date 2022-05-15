const express = require("express");
const controller = require("../controllers/usuarioController");

const router = express.Router();

router.post("/usuarios/login", controller.login);

router.post("/usuarios/registro", controller.registro);

router.post("/usuarios/cadastrar_endereco", controller.cadastrarEndereco);

router.get("/usuarios/dados/:usuario_id", controller.dadosUsuario);

router.get("/usuarios/listar_enderecos", controller.listarEnderecosUsuario);

router.put("/usuarios/alterar_senha", controller.alterarSenhaUsuario);

router.put("/usuarios/endereco/:endereco_id", controller.alterarEndereco);

router.put("/usuarios/endereco_principal", controller.alterarEnderecoPrincipal);

module.exports = router;