const express = require("express");
const model = require("../models/vendedor.model");

const definirNomeVendedor = async function(req, res){

    let usuario_id = req.usuario;

    let dados = req.body;

    try {

        let definir_nome = await model.definir_nome(usuario_id, dados);

        if(definir_nome.erro){
            res.status(400).json({erro: true, msg: "Erro ao alterar nome de vendedor"});
            return;
        }

        res.status(200).json({erro: false, msg:"Nome de vendedor alterado com sucesso!"});

    } catch (error) {
        console.log(error);
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

const buscaTodosVendedores = async function(req, res){

    try {

        let lista_todos_vendedores = await model.lista_todos_vendedores();

        res.status(200).json({erro: false, retorno: lista_todos_vendedores});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

module.exports = {
    definirNomeVendedor,
    buscaTodosVendedores
}