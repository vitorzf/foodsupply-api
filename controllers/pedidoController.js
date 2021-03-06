const express = require("express");
const sql = require("../modules/mysql");
const funcoes = require("../funcoes");
const uuid = require("uuid");

async function dados_vendedor(vendedor_id){

    try {
        
        let lista_vendedor = await sql.execSQL(`SELECT
                                                    u.id,
                                                    u.email,
                                                    u.usuario,
                                                    u.nome_vendedor,
                                                    u.foto
                                                FROM usuario u
                                                INNER JOIN produto p on u.id = p.usuario_id
                                                WHERE u.ativo = 1
                                                AND u.id = ?`, [vendedor_id]);

        if(lista_vendedor.length == 0){
            return false;
        }

        return lista_vendedor[0];

    } catch (error) {
        return false;
    }

}

async function verificar_produtos_venda(dados){

    let produtos_retorno = [];

    try {

        for(const produto_venda of dados.produtos){
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

            let dados_produto = await sql.execSQL(txtSql, [produto_venda.id, dados.vendedor]);

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

async function retorna_dados_produto(vendedor, produto_id){
    try {

        let txtSql = `SELECT p.sku,
                            p.titulo,
                            p.descricao,
                            p.fotos,
                            c.id as categoria_id,
                            c.nome as categoria_nome,
                            um.id as unidade_medida_id,
                            um.sigla as unidade_medida_sigla,
                            um.nome as unidade_medida_nome
                        FROM produto p
                        INNER JOIN usuario u ON u.id = p.usuario_id
                        INNER JOIN categorias c ON c.id = p.categoria_id
                        INNER JOIN unidade_medida um ON um.id = p.medida_id
                        WHERE p.ativo = 1
                        and p.id = ?
                        and p.usuario_id = ?`;

        let busca_produtos = await sql.execSQL(txtSql, [produto_id, vendedor]);

        if(busca_produtos.length == 0){
            return false
        }

        return busca_produtos[0];
        
    } catch (error) {
        return false;
    }
}

const inserirPedido = async function(req, res){

    funcoes.autenticado(req, res);

    let usuario_id = req.usuario;

    let dados = req.body;

    try {
        
        dados.usuario_id = usuario_id;

        let vendedor_existe = await dados_vendedor(dados.vendedor);

        if(!vendedor_existe){
            res.status(400).json({erro: true, retorno:[{msg:"Vendedor n??o encontrado!"}]});
            return;
        }

        if(usuario_id == dados.vendedor){
            res.status(400).json({erro: true, retorno:[{msg:"Voc?? n??o pode comprar da sua Loja!"}]});
            return;
        }

        if(dados.produtos.length == 0){
            res.status(400).json({erro: true, retorno:[{msg:"Nenhum produto enviado no Pedido!"}]});
            return;
        }

        let verifica_produto = await verificar_produtos_venda(dados);

        let erros = [];
        
        let total_venda = 0;

        for(const produto_venda of verifica_produto){
            
            if(produto_venda.existe == false){
                erros.push({produto: produto_venda.id, msg: `Produto n??o encontrado`});
            }

            if(produto_venda.tem_estoque == false){
                erros.push({produto: produto_venda.id, msg: `Produto sem estoque suficiente (${produto_venda.quantidade_venda}): Estoque atual: ${produto_venda.estoque}`});
            }

            total_venda += produto_venda.valor_total;

        }

        if(erros.length != 0){
            res.status(400).json({erro: true, retorno:erros});
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

        let inserir_venda = await sql.insert("venda", dados_venda, true);

        if(!inserir_venda){
            res.status(500).json({erro: true, retorno: [{msg:"Erro ao inserir pedido!"}]});
            return;
        }
    
        let venda_id = inserir_venda;

        for(const produto_venda of verifica_produto){

            let dados_produto_venda = {
                venda_id: venda_id,
                produto_id: produto_venda.id,
                quantidade: produto_venda.quantidade_venda,
                valor_unitario: produto_venda.preco,
                valor_total: produto_venda.valor_total
            }

            let inserir_produto = await sql.insert("venda_produto", dados_produto_venda);

            if(!inserir_produto){
                sql._delete("venda",{id: venda_id});
                sql._delete("venda_produto", {venda_id: venda_id});

                res.status(500).json({erro: true, retorno: [{msg:"Ocorreu algum erro ao inserir a venda!"}]});
                return;
            }

        }

        res.json({erro: false, pedido_id: venda_id});

    } catch (error) {
        console.log(error);
        res.status(500).json({erro: true, retorno: [{msg:"Erro interno do servidor!"}]});
    }

}

const listaPedidos = async function(req, res){

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
                            v.vendedor_id,
                            COALESCE(uv.nome_vendedor, uv.usuario) as nome_vendedor,
                            v.valor_frete,
                            v.valor_total
                        FROM venda v
                        INNER JOIN usuario uv ON uv.id = v.vendedor_id
                        INNER JOIN usuario uc ON uc.id = v.usuario_id
                        WHERE v.usuario_id = ?
                        ${status_filtro}`, [params.usuario_id]);

        res.json({erro: false, pedidos: pedidos})

        
    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor!"});
    }
    
}

const dadosPedido = async function(req, res){

    funcoes.autenticado(req, res);

    let params = req.params;

    params.usuario_id = req.usuario;

    if(params.pedido_id === undefined){

        res.status(400).json({erro: true, msg:"Pedido ID n??o enviado!"});
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
                                                COALESCE(u.nome_vendedor, u.usuario) AS nome_vendedor,
                                                e.id AS endereco_id
                                            FROM venda v
                                            INNER JOIN usuario u ON v.vendedor_id = u.id
                                            INNER JOIN endereco e ON u.id = e.usuario_id
                                            WHERE v.id = ?
                                            and v.usuario_id = ?`, [params.pedido_id, params.usuario_id]);

        if(result_venda.length == 0){
            res.status(404).json({erro: true, msg:"Pedido n??o encontrado!"});
            return;
        }

        let result_produtos = await sql.execSQL(`SELECT produto_id, quantidade, valor_unitario, valor_total FROM venda_produto WHERE venda_id = ?`, [params.pedido_id]);

        if(result_produtos.length == 0){
            res.status(404).json({erro: true, msg:"Produtos do pedido n??o encontrados!"});
            return;
        }

        let dados_venda = result_venda[0];

        let lista_produtos = [];

        for(const produto_venda of result_produtos){

            let retorno_dados_produto = await retorna_dados_produto(dados_venda.vendedor_id, produto_venda.produto_id);
            
            if(!result_produtos.length){
                res.status(404).json({erro: true, msg:"Produto do pedido n??o encontrado!"});
                return;
            }

            let dados_produto = Object.assign({}, produto_venda, retorno_dados_produto);

            lista_produtos.push(dados_produto);

        }

        let endereco_entrega = await sql.execSQL(`SELECT cep, uf, cidade, bairro, endereco, numero FROM endereco WHERE id = ?`, [dados_venda.endereco_id]);

        if(endereco_entrega.length == 0){
            res.status(404).json({erro: true, msg:"Endere??o de entrega n??o encontrado!"});
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

module.exports = {
    inserirPedido,
    listaPedidos,
    dadosPedido
}