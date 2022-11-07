const express = require("express");
const model = require("../models/produto.model");

module.exports = {
    cadastrarProduto : async (req, res) => {
        let usuario_id = req.usuario;

        let produto = req.body;
        
        produto.fotos = JSON.stringify(produto.fotos);
        produto.usuario_id = usuario_id;
    
        try {
    
            let cadastrar_produto = await model.cadastrar_produto(usuario_id, produto);
    
            if(cadastrar_produto.http == 200){
                res.status(200).json({erro: false, msg: "Produto cadastrado com Sucesso!", produto_id: cadastrar_produto.produto_id});
                return;
            }
    
            res.status(cadastrar_produto.http).json({erro: true, msg: cadastrar_produto.msg});
            
        } catch (error) {
            
            // res.status(500).json({erro: true, msg:"Erro interno do servidor"});
            res.status(500).json({erro: true, msg:error});
            
        }
    },
    atualizarProduto : async (req, res) => {
        let produto_id = req.params.produto_id;

        let usuario_id = req.usuario;
    
        let produto = req.body;
    
        produto.fotos = JSON.stringify(produto.fotos);
        produto.usuario_id = usuario_id;
    
        try {
    
            let atualizar_produto = await model.atualizar_produto(produto_id, usuario_id, produto);
    
            if(atualizar_produto.http == 200){
                res.status(200).json({erro: false, msg: atualizar_produto.msg, produto_id: atualizar_produto.produto_id});
                return;
            }
    
            res.status(atualizar_produto.http).json({erro: true, msg: atualizar_produto.msg});
    
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    
    },
    atualizarDadosProduto : async (req, res) => {
        let produto_id = req.params.produto_id;

        let usuario_id = req.usuario;
    
        let produto = req.body;
    
        produto.usuario_id = usuario_id;
    
        try {
    
            let atualizar_dados_produto = await model.atualizar_dados_produto(produto_id, usuario_id, produto);
    
            if(atualizar_dados_produto.http == 200){
                res.status(200).json({erro: false, msg: atualizar_dados_produto.msg, produto: atualizar_dados_produto.produto});
                return;
            }
    
            res.status(atualizar_dados_produto.http).json({erro: true, msg: atualizar_dados_produto.msg});
            
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    
    },
    listaUnidadesMedida : async (req, res) => {
        try {
        
            let busca_unidades = await model.lista_unidades_medida();
    
            res.json({erro: false, retorno: busca_unidades});
    
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    },
    listaCategorias : async (req, res) => {
        try {

            let busca_categorias = await model.lista_categorias()
    
            res.json({erro:false, retorno:busca_categorias});
            
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    },
    listaTodosProdutos : async (req, res) => {
        try {

            let get = req.query;
            
            let filtros = "";
            
            if(get.titulo !== undefined){
                filtros += ` AND p.titulo like '%${get.titulo}%' `;
            }

            filtros += ` AND p.usuario_id <> '${req.usuario}' `;
    
            let lista_todos_produtos = await model.lista_todos_produtos(filtros);
    
            res.json({erro:false, retorno:lista_todos_produtos});
            
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    },
    listaProdutosVendedor : async (req, res) => {
        let dados = req.params;

        try {
        
            let lista_produtos_vendedor = await model.lista_produtos_vendedor(dados);
    
            res.json({erro: false, retorno: lista_produtos_vendedor});
    
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    },
    listaDadosProdutos : async (req, res) => {
        try {

            let produto_id = req.params.produto_id;
    
            let lista_dados_produto = await model.lista_dados_produto(produto_id);
    
            res.json({erro:false, retorno:lista_dados_produto[0]});
            
        } catch (error) {
            res.status(500).json({erro: true, msg:error});
        }
    }
}