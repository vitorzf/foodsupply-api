const express = require("express");
const sql = require("../modules/mysql");
const funcoes = require("../funcoes");

const definirNomeVendedor = async function(req, res){

    funcoes.autenticado(req, res);

    if(!req.autenticado){
        return;
    }

    let usuario_id = req.usuario;

    let dados = req.body;

    try {
        let update = await sql.update("usuario", dados, {id: usuario_id});    
        
        if(update){
            res.json({erro: false, msg:"Nome de Vendedor Atualizado com Sucesso!"});
        }else{
            res.status(500).json({erro: true, msg:"Ocorreu algum erro ao alterar o nome do Vendedor"});
        }

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

const buscaTodosVendedores = async function(req, res){

    try {
        
        let lista_vendedores = await sql.execSQL(`SELECT
                                                u.id,
                                                u.email,
                                                u.usuario,
                                                u.nome_vendedor,
                                                u.foto
                                            FROM usuario u
                                            INNER JOIN produto p on u.id = p.usuario_id
                                            WHERE u.ativo = 1`);

        res.json({erro: false, retorno: lista_vendedores});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

module.exports = {
    definirNomeVendedor,
    buscaTodosVendedores
}