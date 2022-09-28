"use strict";
const crypt = require("./crypt.service");
const axios = require('axios').default; 

module.exports = class MercadoPago{

    credenciaisMP = null;
    pedido_id = null;
    pedido = null;
    produtos = null;
    comprador = null;
    endereco = null;
    valorTotal = null;

    setCredenciais(credenciais){
        this.credenciaisMP = credenciais;
    }

    getCredenciais(){

        //Fazemos a requisição para obter o token do ml

        let headers = {
            "Content-Type": "application/json",
            "Authorization": "TEST-7426611135195185-101317-afdedf8260de7721ca04ab511d029a44-375334628"
        };

        // PUBLIC KEY: TEST-4a4320fe-1e76-4d7e-a91e-ae86a536a163
        // ACCESS TOKEN: TEST-7426611135195185-101317-afdedf8260de7721ca04ab511d029a44-375334628
        // CLIENT ID: 7426611135195185


        axios.post(
            "https://api.mercadopago.com/oauth/token", JSON.stringify({
                client_id: "7426611135195185",
                client_secret: "TEST-4a4320fe-1e76-4d7e-a91e-ae86a536a163",
                grant_type: "authorization_code"
            }), 
            headers
            ).then((response)=> {
                console.log(response);
            }).catch((error) => {
                console.log(error);
            })

    }

    setPedidoID(pedidoID){
        this.pedido_id = pedidoID;
    }

    getPedidoID(){
        return this.pedido_id;
    }

    setPedido(pedido){
        this.pedido = pedido;
    }

    getPedido(){
        return this.pedido;
    }

    setProdutos(produtos){
        this.produtos = produtos;
    }

    getProdutos(){

        let itensPedido = [];
        
        this.produtos.forEach(element => {
            let prodFoto = JSON.parse(element.fotos);

            let prodObjeto = {
                "id": element.sku,
                "title": element.titulo,
                "description": element.descricao,
                "picture_url": prodFoto[0].url,
                "quantity": element.quantidade,
                "unit_price": element.valor_unitario
            }
            itensPedido.push(prodObjeto);
        });

        return itensPedido;
    }
    
    setComprador(comprador){
        this.comprador = comprador;
    }

    getComprador(){

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
    
    setEndereco(endereco){
        this.endereco = endereco;
    }

    getEndereco(){

        return {
            "zip_code": this.endereco.cep,
            "state_name": this.endereco.estado,
            "city_name": this.endereco.cidade,
            "street_name": this.endereco.endereco,
            "street_number": this.endereco.numero
        };
    }

    setValorTotal(valorTotal){
        this.valorTotal = valorTotal;
    }

    getValorTotal(){
        return this.valorTotal;
    }

    getExternalReference(pedido_id){

        return crypt.encrypt(pedido_id);

    }

    checkout(){

        let credenciais = this.getCredenciais();    
        let pedido_id = this.getPedidoID();
        let produtos = this.getProdutos();
        let comprador = this.getComprador();
        let endereco = this.getEndereco();
        let valor_total = this.getValorTotal();
        let hash_pedido = this.getExternalReference(pedido_id);

        let dados_pedido = {
            "additional_info": {
                "items": produtos,
                "payer": comprador,
                "shipments": {
                    "receiver_address": endereco
                },
                "barcode": {}
            },
            "description": `Pagamento do Pedido #${pedido_id} - FoodSupply`,
            "external_reference": hash_pedido,
            "installments": 1,
            "metadata": {},
            "payer": {
                "entity_type": "individual",
                "type": "customer",
                "identification": {}
            },
            "notification_url" : "http://conteumahistoria.com/mercadopago/teste",
            "payment_method_id": "visa",
            "transaction_amount": valor_total
        };

        let headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+ this.getCredenciais()
        };

        axios.post("https://api.mercadopago.com/v1/payments", )
    
    }

}