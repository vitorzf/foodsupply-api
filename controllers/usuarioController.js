const express = require("express");
const md5 = require("md5");
const sql = require("../modules/mysql");
const jwt = require("jsonwebtoken");

const login = async function(req, res){

    let dados = req.body;

    try {
        let result = await sql.execSQL("SELECT * FROM usuario WHERE email = ? AND senha = ?",[dados.email, md5(dados.senha)]);
        
        if(result.length == 0){

            res.status(404).json({erro: true, msg:"Login inválido"});

        }else{
            
            const id = result[0].id;

            const token = jwt.sign({id}, process.env.SECRET, {
                expiresIn:'30d'
            });

            res.json({erro: false, token: token});

        }

    } catch (error) {
        
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        
    }
      
}

const registro = async function(req, res){

    let dados = req.body;
    
    try {

        let email_repetido = await sql.execSQL("SELECT * FROM usuario WHERE email = ?",[dados.email]);

        if(email_repetido.length != 0){
            return res.status(500).json({erro: true, msg:"Email já cadastrado"});
        }

        let usuario_repetido = await sql.execSQL("SELECT * FROM usuario WHERE usuario = ?",[dados.usuario]);

        if(usuario_repetido.length != 0){
            return res.status(500).json({erro: true, msg:"Nome de Usuário já cadastrado"});
        }

        dados.senha = md5(dados.senha);

        let retorno = await sql.insert("usuario", dados, true);
        
        const token = jwt.sign({retorno}, process.env.SECRET, {
            expiresIn:'30d'
        });

        res.status(200).json({erro: false, token: token});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

module.exports = {
    login,
    registro
}