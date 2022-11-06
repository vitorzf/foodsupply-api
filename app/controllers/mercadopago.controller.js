const express = require("express");
const moment = require("moment");

const model = require("../models/pedido.model");

module.exports = {

    callbackMP : async (req, res) => {

        console.log("Callback recebido Mercado Pago");

        let retorno_mp = req.query

        let retorno = await model.salva_dados_pagamento(retorno_mp);
        
        console.log(retorno);

    }

}