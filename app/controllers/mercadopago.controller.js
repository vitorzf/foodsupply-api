const express = require("express");
// const model = require("../models/pedido.model");

module.exports = {

    callbackMP : async (req, res) => {

        // status:
        // aguardando_pagamento
        // pagamento_pendente
        // pagamento_aprovado
        // pagamento_recusado

        console.log("REQUISIÇÃO RECEBIDA");

        let retorno_mp = req.query

        console.log(retorno_mp.status);

        return res.status(200);

    }

}