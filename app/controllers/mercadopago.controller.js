const express = require("express");
const moment = require("moment");

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

        //ATUALIZA VENDA

        let update_mp = {
            callback: JSON.stringify(retorno_mp),
            status: retorno_mp.status,
            data_alteracao: moment().utcOffset(-3).format('YYYY-MM-DD HH:mm:ss'),
        };

        let where_mp = {
            referencia_externa: retorno_mp.external_reference
        };

        let status_mp = "";

        switch (retorno_mp.status) {
            case 'approved':
                status_mp = 'pagamento_aprovado';
                break;

            case 'authorized':
            case 'in_process':
            case 'in_mediation':
                status_mp = "processando_pagamento";
                break;

            case 'rejected':
                status_mp = 'pagamento_rejeitado';
                break;

            case 'cancelled':
                status_mp = 'pagamento_cancelado';
                break;

            case 'refunded':
            case 'charged_back':
                status_mp = 'pagamento_extornado';
                break;

        }

        console.log("update mp", update_mp);
        console.log("where mp", where_mp);
        console.log("status_mp", status_mp);

        return res.status(200);

    }

}