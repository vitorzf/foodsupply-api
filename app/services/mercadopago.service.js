"use strict";
const crypt = require("./crypt.service");
const axios = require('axios').default;

module.exports = class MercadoPago {

    access_token = null;
    pedido_id = null;
    pedido = null;
    produtos = null;
    comprador = null;
    valorFrete = 0;
    sandbox = true;

    setCredenciais(credenciais) {
        this.access_token = credenciais;
    }

    getCredenciais() {

       return this.access_token;

    }

    setPedidoID(pedidoID) {
        this.pedido_id = pedidoID;
    }

    getPedidoID() {
        return this.pedido_id;
    }

    setPedido(pedido) {
        this.pedido = pedido;
    }

    getPedido() {
        return this.pedido;
    }

    setProdutos(produtos) {
        this.produtos = produtos;
    }

    getProdutos() {

        let itensPedido = [];

        this.produtos.forEach(element => {
            let prodFoto = JSON.parse(element.fotos);

            let prodObjeto = {
                "id": element.sku,
                "title": element.titulo,
                "description": element.descricao,
                "picture_url": prodFoto[0].url,
                "quantity": element.quantidade,
                "unit_price": element.valor_unitario,
                "currency_id": "BRL"
            }

            itensPedido.push(prodObjeto);
        });

        let valor_frete = this.getValorFrete();

        if(valor_frete != 0){

            let objFrete = {
                "id": "FreteEnvio",
                "title": "Valor total de Frete",
                "description": "Este é um adicional do valor dos itens cobrado para envio da mercadoria",
                "picture_url": "",
                "quantity": 1,
                "unit_price": valor_frete,
                "currency_id": "BRL"
            }

            itensPedido.push(objFrete);
        }

        return itensPedido;
    }

    setComprador(comprador) {
        this.comprador = comprador;
    }

    getComprador() {

        return {
            "first_name": this.comprador.nome,
            "last_name": this.comprador.sobrenome,
            "phone": {},
            "address": {
                "zipcode": this.comprador.cep,
                "street_name": this.comprador.endereco,
                "street_number": this.comprador.numero,
            }
        };

    }

    setValorFrete(valorFrete) {
        this.valorFrete = valorFrete;
    }

    getValorFrete() {
        return this.valorFrete;
    }

    getExternalReference(pedido_id) {

        return crypt.encrypt(pedido_id);

    }

    async checkout() {

        let pedido_id = this.getPedidoID();
        let produtos = this.getProdutos();
        let comprador = this.getComprador();
        let hash_pedido = this.getExternalReference(pedido_id);

        let dados_pedido = {
            "items": produtos,
            "payer": comprador,
            "back_urls": {
                "pending": "https://foodsupply2.herokuapp.com/mercadopago/pending",
                "success": "https://foodsupply2.herokuapp.com/mercadopago/success",
                "failure": "https://foodsupply2.herokuapp.com/mercadopago/failure"
            },
            "auto_return": "approved",
            "payment_methods": {
                "excluded_payment_types": [
                    {
                        "id": "ticket"
                    }
                ],
                "installments": 1,
                "default_installments": 1
            },
            "notification_url": "https://foodsupply2.herokuapp.com/mercadopago",
            "external_reference": hash_pedido,
            "expires": false,
            "site_id": "MLB",
            "expiration_date_from": null,
            "expiration_date_to": null
        };

        let config = {
            headers:{
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.getCredenciais()
            }
        };

        console.log("Fazendo requisição MP");

        await axios.post(
            "https://api.mercadopago.com/checkout/preferences",
            JSON.stringify(dados_pedido), 
            config
        ).then((response) => {
            
            let retorno = response.data;

            let url = (this.sandbox ? retorno.sandbox_init_point : retorno.init_point);

            return {erro: false, url:url, referencia_externa: retorno.external_reference};

        }).catch((err) => {

            console.log(err);

            return {erro: true};

        })

    }

}