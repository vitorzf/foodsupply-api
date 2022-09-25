const express = require("express");
const uuid = require("uuid");
const model = require("../models/pedido.model");

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
            console.log(error);
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
            console.log(error);
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
    
            let _pedido = await sql.execSQL(`SELECT id, valor_frete, valor_total
                                            FROM venda 
                                            WHERE id = ? 
                                            and usuario_id = ? 
                                            and status = 'aguardando_pagamento'`, [params.pedido_id, params.usuario_id]);
    
            if (_pedido.length == 0) {
                res.status(404).json({ erro: true, retorno: [{ msg: "Pedido não encontrado" }] });
                return;
            }
    
            _pedido = _pedido[0];
    
            let result_produtos = await sql.execSQL(`SELECT vp.produto_id, p.sku, p.fotos, p.titulo, p.descricao, vp.quantidade, vp.valor_unitario, vp.valor_total 
                                                    FROM venda_produto vp
                                                    INNER JOIN produto p on p.id = vp.produto_id 
                                                    WHERE vp.venda_id = ?`, [params.pedido_id]);
    
            if (result_produtos.length == 0) {
                res.status(404).json({ erro: true, msg: "Produtos do pedido não encontrados!" });
                return;
            }
    
            let result_comprador = await sql.execSQL(`SELECT u.*, e.*  FROM venda v 
                                                    INNER JOIN usuario u on u.id = v.usuario_id
                                                    INNER JOIN endereco e on e.id = v.endereco_id
                                                    WHERE v.id = ?`, [params.pedido_id]);
            
            if (result_comprador.length == 0) {
                res.status(404).json({ erro: true, msg: "Comprador do pedido não encontrado!" });
                return;
            }
    
            objetoComprador = result_comprador[0];
    
            let result_endereco = await sql.execSQL(`SELECT e.*, retornaNomeEstado(e.uf) as estado
                                                    FROM venda v 
                                                    INNER JOIN endereco e on e.id = v.endereco_id
                                                    where v.id = ?`, [params.pedido_id]);
            
            if (result_endereco.length == 0) {
                res.status(404).json({ erro: true, msg: "Endereço do comprador não encontrado!" });
                return;
            }
    
            let enderecoObj = result_endereco[0];
    
            let comprador = {
                "first_name": objetoComprador.nome,
                "last_name": objetoComprador.sobrenome,
                "phone": {},
                "address": {
                    "zipcode": objetoComprador.cep,
                    "street_name": objetoComprador.endereco,
                    "street_number": objetoComprador.numero,
                }
            };
    
            let itensPedido = [];
            
            result_produtos.forEach(element => {
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
    
            let endereco = {
                "zip_code": enderecoObj.cep,
                "state_name": enderecoObj.estado,
                "city_name": enderecoObj.cidade,
                "street_name": enderecoObj.endereco,
                "street_number": enderecoObj.numero
            };
    
            // let referencia = new Buffer(`${params.pedido_id}-${params.usuario_id}`).toString("hex");
    
            let dados_pedido = {
                "additional_info": {
                    "items": itensPedido,
                    "payer": comprador,
                    "shipments": {
                        "receiver_address": endereco
                    },
                    "barcode": {}
                },
                "description": `Pagamento do Pedido #${params.pedido_id} - FoodSupply`,
                "external_reference": '',
                "installments": 1,
                "metadata": {},
                "payer": {
                    "entity_type": "individual",
                    "type": "customer",
                    "identification": {}
                },
                "payment_method_id": "visa",
                "transaction_amount": _pedido.valor_total
            };
    
            console.log(dados_pedido);
            return;
    
        } catch (error) {
            console.log(error);
            res.status(500).json({ erro: true, msg: "Erro interno do servidor!" });
        }
    }
}