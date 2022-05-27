const express = require("express");
const sql = require("../modules/mysql");
const funcoes = require("../funcoes");
const uuid = require("uuid");

async function verificar_produtos_venda(produtos){

    let produtos_retorno = [];

    try {

        for(const produto_venda of produtos){
            let txtSql = `select
                                p.*,
                                CASE WHEN p.estoque >= ${produto_venda.quantidade} THEN true
                                ELSE false END as tem_estoque,
                                '${produto_venda.quantidade}' as quantidade_venda,
                                true as existe,
                                ${produto_venda.quantidade} * p.preco as valor_total
                            from produto p
                            where p.id = ?
                            and p.usuario_id = ?`;

            let dados_produto = await sql.execSQL(txtSql, [produto_venda.produto_id, produto_venda.vendedor]);

            if(dados_produto.length == 0){
                produtos_retorno.push({id:produto_venda.id, existe: false, tem_estoque: true, total_venda: 0});
            }else{
                produtos_retorno.push(dados_produto[0]);
            }
        }

        return produtos_retorno;
        
    } catch (error) {
        return {msg: "Erro ao salvar pedido"};
    }

}

const listaVendas = async function(req, res){

    funcoes.autenticado(req, res);

    let params = req.params;

    params.usuario_id = req.usuario;

    try {
        let status_filtro = "";

        if(params.status_pedido !== undefined){
            status_filtro = ` AND v.status = '${params.status_pedido}' `;
        }

        /* 
            v = Tabela de venda
            uv = Usuario Vendedor
            uc = Usuario Comprador
        */

        let pedidos = await sql.execSQL(` SELECT 
                            v.id,
                            v.status,
                            retornaDescricaoStatus(v.status) as descricao_status,
                            v.valor_frete,
                            v.valor_total
                        FROM venda v
                        INNER JOIN usuario uv ON uv.id = v.vendedor_id
                        INNER JOIN usuario uc ON uc.id = v.usuario_id
                        WHERE v.vendedor_id = ?
                        ${status_filtro}`, [params.usuario_id]);

        res.json({erro: false, pedidos: pedidos})

        
    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
    }
    
}

const dadosVenda = async function(req, res){

    funcoes.autenticado(req, res);

    let params = req.params;

    params.usuario_id = req.usuario;

    if(params.venda_id === undefined){

        res.status(400).json({erro: true, msg:"Pedido ID não enviado!"});
        return;

    }

    try {

        let result_venda = await sql.execSQL(`SELECT
                                                v.id,
                                                v.status,
                                                retornaDescricaoStatus(v.status) AS descricao_status,
                                                v.valor_total,
                                                v.valor_frete,
                                                v.vendedor_id,
                                                e.id AS endereco_id
                                            FROM venda v
                                            INNER JOIN usuario u ON v.vendedor_id = u.id
                                            INNER JOIN endereco e ON u.id = e.usuario_id
                                            WHERE v.id = ?
                                            and v.vendedor_id = ?`, [params.venda_id, params.usuario_id]);

        if(result_venda.length == 0){
            res.status(404).json({erro: true, msg:"Pedido não encontrado!"});
            return;
        }

        let result_produtos = await sql.execSQL(`SELECT produto_id, quantidade, valor_unitario, valor_total FROM venda_produto WHERE venda_id = ?`, [params.venda_id]);

        if(result_produtos.length == 0){
            res.status(404).json({erro: true, msg:"Produtos do pedido não encontrados!"});
            return;
        }

        let dados_venda = result_venda[0];
        let lista_produtos = result_produtos;

        let endereco_entrega = await sql.execSQL(`SELECT cep, uf, cidade, bairro, endereco, numero FROM endereco WHERE id = ?`, [dados_venda.endereco_id]);

        if(endereco_entrega.length == 0){
            res.status(404).json({erro: true, msg:"Endereço de entrega não encontrado!"});
            return;
        }

        let info_adicional = {
            endereco: endereco_entrega[0],
            produtos: lista_produtos
        }

        const retorno = Object.assign({}, dados_venda, info_adicional);

        res.json({erro: false, pedido: retorno});
        
    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
    }
    
}

const confirmarVenda = async function(req, res){

    funcoes.autenticado(req, res);

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
        
        let lista_produtos_pedido = await sql.execSQL(`SELECT 
                                                            vp.*,
                                                            p.usuario_id as vendedor
                                                        FROM venda_produto vp 
                                                        INNER JOIN produto p on p.id = vp.produto_id
                                                        WHERE vp.venda_id = ?`, [params.venda_id]);

        if(lista_produtos_pedido.length == 0){
            res.status(400).json({erro: true, retorno: [{msg: "Nenhum produto encontrado"}]});
            return;
        }

        // let verifica_produto = await verificar_produtos_venda(lista_produtos_pedido);

        // let erros = [];

        // for(const produto_venda of verifica_produto){
            
        //     if(produto_venda.existe == false){
        //         erros.push({produto: produto_venda.id, msg: `Produto não encontrado`});
        //     }

        //     if(produto_venda.tem_estoque == false){
        //         erros.push({produto: produto_venda.id, msg: `Produto sem estoque suficiente (${produto_venda.quantidade_venda}): Estoque atual: ${produto_venda.estoque}`});
        //     }

        // }

        // if(erros.length != 0){
        //     res.status(400).json({erro: true, retorno:erros});
        //     return;
        // }

        let busca_dados_pedido = await sql.execSQL("SELECT * FROM venda WHERE id = ?", [params.venda_id]);

        let dados_pedido = busca_dados_pedido[0];

        let ja_alterou_anteriormente = false;

        if(dados_pedido.status != 'aguardando_vendedor'){
            ja_alterou_anteriormente = true;
        }

        dados_pedido.status = 'aguardando_pagamento';

        //Caso o valor do frete ja tenha sido enviado anteriormente, ele remove o total do frete atual
        //define o novo valor de frete e recalcula posteriormente o total do pedido
        if(dados_pedido.valor_frete != 0){
            dados_pedido.valor_total = dados_pedido.valor_total - dados_pedido.valor_frete;
            dados_pedido.valor_frete = 0;
        }

        dados_pedido.valor_total = dados_pedido.valor_total + params.frete;
        dados_pedido.valor_frete = params.frete;

        let update_pedido = await sql.update("venda", dados_pedido, {id: params.venda_id});

        if(!update_pedido){
            res.status(500).json({erro: true, msg:"Erro ao alterar Pedido"});
        }

        // if(ja_alterou_anteriormente){
        //     res.json({erro: false, msg:"Pedido alterado com sucesso!"});
        //     return;
        // }

        // for(const produto_venda of verifica_produto){

        //     let update_produto = {
        //         estoque: parseFloat(produto_venda.estoque) - parseFloat(produto_venda.quantidade_venda),
        //     };

        //     let fez_update = await sql.update('produto',update_produto, {id: produto_venda.id});

        //     if(!fez_update){
        //         res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
        //         return;
        //     }

        // }
        
        res.json({erro: false, msg:"Pedido alterado com sucesso!"});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
    }

}

module.exports = {
    listaVendas,
    dadosVenda,
    confirmarVenda
}