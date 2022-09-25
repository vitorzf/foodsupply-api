const express = require("express");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const model = require("../models/usuario.model");

module.exports = {
    login : async (req, res) => {
        let dados = req.body;

        try {
            let result = await model.login(dados);
            
            if(result.length == 0){
    
                res.status(404).json({erro: true, msg:"Login inválido"});
    
            }else{
                
                const id = result[0].id;
    
                const token = jwt.sign({id}, process.env.SECRET, {
                    expiresIn:'30d'
                });
    
                res.json({erro: false, token: token, usuario: result[0]});
    
            }
    
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
            
        }
    },
    registro : async (req, res) => {

        let dados = req.body;
    
        try {
    
            let checagens = await model.checagens_registro(dados);
    
            if(!checagens.erro){
                dados.senha = md5(dados.senha);
    
                let retorno = await sql.insert("usuario", dados, true);
                
                const token = jwt.sign({retorno}, process.env.SECRET, {
                    expiresIn:'30d'
                });
        
                delete dados.senha;
        
                dados.nome_vendedor = "";
        
                res.json({erro: false, token: token, usuario: dados});
                return;
            }
    
            res.status(400).json(checagens);
    
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    
    },
    dadosUsuario : async (req, res) => {
        let params = req.params;

        try {
    
            let dados_usuario = await model.dados_usuario(params);
    
            if(dados_usuario.length == 0){
                return res.status(404).json({erro: true, msg:"Usuário não encontrado"});
            }
    
            return res.json({erro: false, retorno:dados_usuario});
            
        } catch (error) {
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    },
    alterarSenhaUsuario : async (req, res) => {
        let params = {senha: md5(req.body.senha)};

        let where = {id: req.usuario};
    
        try {
    
            let alterar_senha = await model.alterar_senha(params, where);
    
            if(alterar_senha.erro){
                res.status(400).json(alterar_senha);
                return;
            }
    
            res.status(200).json(alterar_senha);
    
        } catch (error) {
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    },
    cadastrarEndereco : async (req, res) => {
        let dados = req.body;
    
        try {
    
            dados.usuario_id = req.usuario;
    
            let cadastrar_endereco = await model.cadastrar_endereco(req, dados);
    
            if(cadastrar_endereco.erro){
                res.status(400).json(cadastrar_endereco);
                return;
            }
    
            res.json({erro: false, msg: "Endereço cadastrado com Sucesso!", retorno: cadastrar_endereco.retorno});
    
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    },
    listarEnderecosUsuario : async (req, res) => {
        try {

            let enderecos = await lista_enderecos(req.usuario);
    
            return res.json({erro: false, retorno:enderecos});
            
        } catch (error) {
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    },
    alterarEndereco : async (req, res) => {
        let dados = req.body;
    
        try {
    
            dados.usuario_id = req.usuario;
    
            let alterar_endereco = await model.alterar_endereco(req, dados);
    
            if(alterar_endereco.erro){
                res.status(400).json(alterar_endereco);
                return;
            }
    
            res.status(200).json({erro: false, msg: "Endereço alterado com Sucesso!", retorno: alterar_endereco.retorno});
    
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    },
    alterarEnderecoPrincipal : async (req, res) => {
        try {

            let alterar_endereco_principal = await model.alterar_endereco_principal(req);
    
            if(alterar_endereco_principal.erro){
                res.status(400).json(alterar_endereco_principal);
                return;
            }
    
            res.status(200).json(alterar_endereco_principal);
    
            
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }
    }
}