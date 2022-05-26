const express = require("express");
const md5 = require("md5");
const sql = require("../modules/mysql");
const jwt = require("jsonwebtoken");
const funcoes = require("../funcoes");

async function listaProduto(produto_id, usuario_id){
    try {

        let txtSql = `SELECT p.id,
                            p.sku,
                            p.titulo,
                            p.descricao,
                            p.preco,
                            p.estoque,
                            p.fotos,
                            p.data_hora_cadastro,
                            c.id as categoria_id,
                            c.nome as categoria_nome,
                            um.id as unidade_medida_id,
                            um.sigla as unidade_medida_sigla,
                            um.nome as unidade_medida_nome,
                            u.id as vendedor_id,
                            COALESCE(u.nome_vendedor, u.usuario) as nome_vendedor
                        FROM produto p
                        INNER JOIN usuario u ON u.id = p.usuario_id
                        INNER JOIN categorias c ON c.id = p.categoria_id
                        INNER JOIN unidade_medida um ON um.id = p.medida_id
                        WHERE p.ativo = 1
                        and p.id = ?
                        and p.usuario_id = ?`;

        let busca_produtos = await sql.execSQL(txtSql, [produto_id, usuario_id]);

        if(busca_produtos.length == 0){
            return null
        }

        return busca_produtos[0];
        
    } catch (error) {
        return error;
    }

}

const cadastrarProduto = async function(req, res){
    
    funcoes.autenticado(req, res);

    let usuario_id = req.usuario;

    let produto = req.body;
    
    produto.fotos = JSON.stringify(produto.fotos);
    produto.usuario_id = usuario_id;

    try {

        let busca_produto_existente = await sql.execSQL(
            "SELECT id FROM produto WHERE sku = ? AND usuario_id = ?",
            [produto.sku, usuario_id]
        );
        
        if(busca_produto_existente.length != 0){

            return res.status(400).json({erro:true, msg:`SKU ${produto.sku} já cadastrado para o usuário`});

        }

        let produto_id = await sql.insert("produto", produto, true);

        if(produto_id.length != 0){
            res.json({erro: false, msg: "Produto Criado com Sucesso!", produto_id: produto_id})
        }else{
            res.status(500).json({erro: true, msg:"Erro ao cadastrar Produto!"});
        }

    } catch (error) {
        
        // res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        res.status(500).json({erro: true, msg:error});
        
    }
      
}

const atualizarProduto = async function(req, res){

    funcoes.autenticado(req, res);

    let produto_id = req.params.produto_id;

    let usuario_id = req.usuario;

    let produto = req.body;

    produto.fotos = JSON.stringify(produto.fotos);
    produto.usuario_id = usuario_id;

    try {

        let busca_produto_existente = await sql.execSQL(
            "SELECT id FROM produto WHERE sku = ? AND usuario_id = ?",
            [produto.sku, usuario_id]
        );
        
        if(busca_produto_existente.length == 0){
    
            return res.status(404).json({erro:true, msg:`Produto não encontrado`});
    
        }

        let condicao = {
            id: produto_id,
            usuario_id: usuario_id
        };

        let atualizar = await sql.update("produto", produto, condicao);

        if(atualizar){

            res.json({erro: false, msg: "Produto Atualizado com Sucesso!", produto_id: produto_id})

        }else{

            res.status(500).json({erro: true, msg:"Erro ao atualizar Produto!"});

        }
    } catch (error) {
        res.status(500).json({erro: true, msg:error});
    }

}

const atualizarDadosProduto = async function(req, res){

    funcoes.autenticado(req, res);

    let produto_id = req.params.produto_id;

    let usuario_id = req.usuario;

    let produto = req.body;

    produto.usuario_id = usuario_id;

    try {

        let busca_produto_existente = await sql.execSQL(
            "SELECT id FROM produto WHERE id = ? AND usuario_id = ?",
            [produto_id, usuario_id]
        );
        
        if(busca_produto_existente.length == 0){
    
            return res.status(404).json({erro:true, msg:`Produto não encontrado`});
    
        }

        let condicao = {
            id: produto_id,
            usuario_id: usuario_id
        };

        let atualizar = await sql.update("produto", produto, condicao);

        if(atualizar){

            dados_produto = await listaProduto(produto_id, usuario_id);

            if(typeof(dados_produto) != "object"){
                res.status(500).json({erro: true, msg:"Erro ao atualizar Produto!"});
            }

            res.json({erro: false, msg: "Produto Atualizado com Sucesso!", produto: dados_produto})

        }else{

            res.status(500).json({erro: true, msg:"Erro ao atualizar Produto!"});

        }
    } catch (error) {
        res.status(500).json({erro: true, msg:error});
    }

}

const listaUnidadesMedida = async function(req, res){

    try {
        
        let busca_unidades = await sql.execSQL("SELECT * FROM unidade_medida");

        res.json({erro: false, retorno: busca_unidades});

    } catch (error) {
        res.status(500).json({erro: true, msg:error});
    }

}

const listaCategorias = async function(req, res){

    try {

        let busca_categorias = await sql.execSQL("SELECT * FROM categorias ORDER BY nome ASC");

        res.json({erro:false, retorno:busca_categorias});
        
    } catch (error) {
        res.status(500).json({erro: true, msg:error});
    }

}

const listaTodosProdutos = async function(req, res){

    try {

        let txtSql = `SELECT p.id,
                            p.sku,
                            p.titulo,
                            p.descricao,
                            p.preco,
                            p.estoque,
                            p.fotos,
                            p.data_hora_cadastro,
                            c.id as categoria_id,
                            c.nome as categoria_nome,
                            um.id as unidade_medida_id,
                            um.sigla as unidade_medida_sigla,
                            um.nome as unidade_medida_nome,
                            u.id as vendedor_id,
                            COALESCE(u.nome_vendedor, u.usuario) as nome_vendedor
                        FROM produto p
                        INNER JOIN usuario u ON u.id = p.usuario_id
                        INNER JOIN categorias c ON c.id = p.categoria_id
                        INNER JOIN unidade_medida um ON um.id = p.medida_id
                        WHERE p.ativo = 1`;

        let busca_produtos = await sql.execSQL(txtSql);

        res.json({erro:false, retorno:busca_produtos});
        
    } catch (error) {
        res.status(500).json({erro: true, msg:error});
    }

}

const listaProdutosVendedor = async function(req, res){

    let dados = req.params;

    try {

        let txtSql = `SELECT p.id,
                            p.sku,
                            p.titulo,
                            p.descricao,
                            p.preco,
                            p.estoque,
                            p.fotos,
                            p.data_hora_cadastro,
                            c.id as categoria_id,
                            c.nome as categoria_nome,
                            um.id as unidade_medida_id,
                            um.sigla as unidade_medida_sigla,
                            um.nome as unidade_medida_nome
                        FROM produto p
                        INNER JOIN usuario u ON u.id = p.usuario_id
                        INNER JOIN categorias c ON c.id = p.categoria_id
                        INNER JOIN unidade_medida um ON um.id = p.medida_id
                        WHERE p.ativo = 1
                        and p.usuario_id = ?`;
        
        let produtos = await sql.execSQL(txtSql, [dados.vendedor_id]);

        res.json({erro: false, retorno: produtos});

    } catch (error) {
        res.status(500).json({erro: true, msg:error});
    }

}

module.exports = {
    cadastrarProduto,
    atualizarProduto,
    atualizarDadosProduto,
    listaUnidadesMedida,
    listaCategorias,
    listaTodosProdutos,
    listaProdutosVendedor
}