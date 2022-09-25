const express = require("express");
const uuid = require("uuid");
const model = require("../models/venda.model");

module.exports = {
    listaVendas : async (req, res) => {
        let params = req.params;

        params.usuario_id = req.usuario;
    
        try {
            let status_filtro = "";
    
            if(params.status_pedido !== undefined){
                status_filtro = ` AND v.status = '${params.status_pedido}' `;
            }
    
            let pedidos = await model.lista_vendas(params.usuario_id, status_filtro);
    
            res.json({erro: false, pedidos: pedidos})
    
            
        } catch (error) {
            res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
        }
    },
    dadosVenda : async (req, res) => {
        let params = req.params;

        params.usuario_id = req.usuario;
    
        if(params.venda_id === undefined){
    
            res.status(400).json({erro: true, msg:"Pedido ID não enviado!"});
            return;
    
        }
    
        try {
    
            let venda = await model.dados_venda(params.usuario_id, params.venda_id);
    
            if(venda.erro){
                res.status(404).json(venda);
                return;
            }
    
            res.status(200).json(venda);
            return;
            
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
        }
    },
    confirmarVenda : async (req, res) => {
        let params = req.params;

        params.usuario_id = req.usuario;
    
        params.frete = req.body.frete;
    
        if(params.venda_id === undefined){
    
            res.status(400).json({erro: true, msg:"Pedido ID não enviado!"});
            return;
    
        }
    
        if(params.frete === undefined){
    
            res.status(400).json({erro: true, msg:"Valor do frete do Pedido não enviado!"});
            return;
    
        }
    
        try {
    
            let confirmar_venda = model.confirmar_venda(params.usuario_id, params.venda_id);
    
            if(confirmar_venda.erro){
                res.status(confirmar_venda.http).json({erro: true, msg: confirmar_venda.msg});
            }
    
            res.status(200).json(confirmar_venda);
            return;
    
        } catch (error) {
            console.log(error);
            res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
        }
    }
}