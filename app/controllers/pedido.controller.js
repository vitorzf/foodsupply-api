const express = require("express");
const uuid = require("uuid");
const model = require("../models/pedido.model");
const MercadoPago = require("../services/mercadopago.service");

module.exports = {
    inserirPedido : async (req, res) => {
        let usuario_id = req.usuario;

        let dados = req.body;

        try {

            dados.usuario_id = usuario_id;

            let vendedor_existe = await model.dados_vendedor(dados.vendedor);

            if (!vendedor_existe) {
                res.status(400).json({ erro: true, retorno: [{ msg: "Vendedor não encontrado!" }] });
                return;
            }

            if (usuario_id == dados.vendedor) {
                res.status(400).json({ erro: true, retorno: [{ msg: "Você não pode comprar da sua Loja!" }] });
                return;
            }

            if (dados.produtos.length == 0) {
                res.status(400).json({ erro: true, retorno: [{ msg: "Nenhum produto enviado no Pedido!" }] });
                return;
            }

            let verifica_produto = await model.verificar_produtos_venda(dados);

            let erros = [];

            let total_venda = 0;

            for (const produto_venda of verifica_produto) {

                if (produto_venda.existe == false) {
                    erros.push({ produto: produto_venda.id, msg: `Produto não encontrado` });
                }

                if (produto_venda.tem_estoque == false) {
                    erros.push({ produto: produto_venda.id, msg: `Produto sem estoque suficiente (${produto_venda.quantidade_venda}): Estoque atual: ${produto_venda.estoque}` });
                }

                total_venda += produto_venda.valor_total;

            }

            if (erros.length != 0) {
                res.status(400).json({ erro: true, retorno: erros });
                return;
            }

            let dados_venda = {
                status: "aguardando_vendedor",
                identificador_pagamento: uuid.v4(),
                vendedor_id: dados.vendedor,
                usuario_id: usuario_id,
                endereco_id: dados.endereco,
                valor_total: total_venda
            };

            let inserir_venda = await model.inserir_venda(dados_venda);

            if (!inserir_venda) {
                res.status(500).json({ erro: true, retorno: [{ msg: "Erro ao inserir pedido!" }] });
                return;
            }

            let venda_id = inserir_venda;

            let inserir_produtos_venda = await model.inserir_produtos_venda(venda_id, verifica_produto);

            if(!inserir_produtos_venda){
                res.status(500).json({ erro: true, retorno: [{ msg: "Ocorreu algum erro ao inserir a venda!" }] });
                return;
            }

            res.status(200).json({ erro: false, pedido_id: venda_id });

        } catch (error) {
            // console.log(error);
            res.status(500).json({ erro: true, retorno: [{ msg: "Erro interno do servidor!" }] });
        }
    },
    listaPedidos : async (req, res) => {

        let params = req.params;

        params.usuario_id = req.usuario;
    
        try {
            
            let pedidos = await model.lista_pedidos(params);
    
            res.json({ erro: false, pedidos: pedidos })
    
    
        } catch (error) {
            res.status(500).json({ erro: true, msg: "Erro interno do servidor!" });
        }
    
    },
    dadosPedido : async (req, res) => {

        let params = req.params;

        params.usuario_id = req.usuario;

        if (params.pedido_id === undefined) {

            res.status(400).json({ erro: true, msg: "Pedido ID não enviado!" });
            return;

        }

        try {

            let dados_pedido = await model.dados_pedido(params);

            if(dados_pedido.http == 200){
                res.status(200).json({erro: false, retorno: dados_pedido.pedido});
                return;
            }

            res.status(dados_pedido.http).json({erro: true, msg: dados_pedido.msg});

        } catch (error) {
            // console.log(error);
            res.status(500).json({ erro: true, msg: "Erro interno do servidor!" });
        }

    },
    rejeitarFrete : async (req, res) => {

        let params = req.params;

        params.usuario_id = req.usuario;

        try {

            let rejeitar_frete = await model.rejeitar_frete(params);

            if(rejeitar_frete.http == 200){
                res.status(200).json({erro: false, retorno: rejeitar_frete.pedido});
                return;
            }

            res.status(rejeitar_frete.http).json({erro: true, msg: rejeitar_frete.msg});

        } catch (error) {
            res.status(500).json({ erro: true, msg: "Erro interno do servidor!" });
        }

    },
    aceitarFrete : async (req, res) => {
        let params = req.params;

        params.usuario_id = req.usuario;
    
        try {

            let mp = new MercadoPago();

            mp.setPedidoID(params.pedido_id);

            let _pedido = await model.info_pedido(params.pedido_id, params.usuario_id);
    
            if (_pedido.length == 0) {
                res.status(404).json({ erro: true, msg: "Pedido não encontrado"});
                return;
            }
    
            _pedido = _pedido[0];
    
            let result_produtos = await model.produtos_venda(params.pedido_id, params.usuario_id);
    
            if (result_produtos.length == 0) {
                res.status(404).json({ erro: true, msg: "Produtos do pedido não encontrados!" });
                return;
            }
    
            let result_comprador = await model.comprador_venda(params.pedido_id);
            
            if (result_comprador.length == 0) {
                res.status(404).json({ erro: true, msg: "Comprador do pedido não encontrado!" });
                return;
            }
    
            objetoComprador = result_comprador[0];

            let dados_usuario = await model.buscar_token_mp(_pedido.vendedor_id);

            let token_mercado_pago = dados_usuario[0].token_mercado_pago;

            if(token_mercado_pago == null){
                res.status(400).json({ erro: true, msg: "O vendedor ainda não está pronto para receber pagamentos!" });
                return;
            }

            mp.setCredenciais(token_mercado_pago);
            // mp.setCredenciais("APP_USR-2939643210865409-092801-4f44a54d09df67f3121ecec5dd21b7dd-375334628");
            mp.setComprador(objetoComprador);
            mp.setPedido(_pedido);
            mp.setProdutos(result_produtos);
            mp.setExternalReference(_pedido.identificador_pagamento);
            mp.setValorFrete(_pedido.valor_frete);

            let objPagto =  null;

            let isTest = token_mercado_pago.split("-")[0];

            let sandbox = (isTest == "TEST" ? true : false);

            await mp.checkout().then((response) => {
            
                let retorno = response.data;
    
                let url = (sandbox ? retorno.sandbox_init_point : retorno.init_point);
    
                objPagto = {
                    venda_id: _pedido.id,
                    cliente_id: objetoComprador.id,
                    url: url,
                    referencia_externa: retorno.external_reference,
                    dados_criacao: JSON.stringify(retorno),
                    status: "pending"
                };
    
            }).catch((err) => {
    
                // console.log(err);
    
                res.status(500).json({erro: true, msg:"Erro ao gerar pagamento no Mercado Pago"});
                return;
    
            });

            await model.begin_transaction();

            let insertPagamento = await model.inserir_pagamento(objPagto);

            let updatePedido = await model.alterar_status_pedido(_pedido.id, 'aguardando_pagamento');

            if(!insertPagamento || !updatePedido){
                await model.rollback_transaction();
                res.status(400).json({erro: false, msg: "Erro ao gerar pagamento no Mercado Pago"});
                return;
            }

            await model.commit_transaction();

            delete(objPagto.dados_criacao);

            res.status(200).json({erro:false, retorno: objPagto});
            return;
    
        } catch (error) {
            // console.log(error);
            res.status(500).json({ erro: true, msg: "Erro interno do servidor!" });
        }
    }
}