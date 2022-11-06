const express = require("express")

const model = require("../models/pedido.model");

module.exports = {

    recebidoMP : async (req, res) => {
        res.status(200);
        return;
    },

    callbackMP : async (req, res) => {

        console.log("Callback recebido Mercado Pago");

        let retorno_mp = req.query

        let retorno = await model.salva_dados_pagamento(retorno_mp);
        
        res.sendFile("../views/retorno_mp.html");
        
        res.status(retorno.http);
            // .json({erro: retorno.erro, msg: retorno.msg});
    }

}