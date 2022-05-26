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

            
                            
            let dados_produto = await sql.execSQL(txtSql, [produto_venda.id, dados.usuario_id]);

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

        let txtSql = `SELECT p.id,
                            p.sku,
                            p.titulo,
                            p.descricao,
                            p.preco,
                            p.estoque,
                            p.fotos,
                            p.data_hora_cadastro,
                            c.id as categoria_id,
                            c.nome as categoria_nome,
                            um.id as unidade_medida_id,
                            um.sigla as unidade_medida_sigla,
                            um.nome as unidade_medida_nome,
                            u.id as vendedor_id,
                            COALESCE(u.nome_vendedor, u.usuario) as nome_vendedor
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

const inserirVenda = async function(req, res){

    funcoes.autenticado(req, res);

    let usuario_id = req.usuario;

    let dados = req.body;

    try {
        
        dados.usuario_id = usuario_id;

        let vendedor_existe = await dados_vendedor(dados.vendedor);

        if(!vendedor_existe){
            res.status(400).json({erro: true, retorno:[{msg:"Vendedor não encontrado!"}]});
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
                erros.push({produto: produto_venda.id, msg: `Produto não encontrado`});
            }

            if(produto_venda.tem_estoque == false){
                erros.push({produto: produto_venda.id, msg: `Produto sem estoque suficiente (${produto_venda.quantidade_venda}): Estoque atual: ${produto_venda.estoque}`});
            }

            total_venda += produto_venda.valor_total;

        }

        if(erros.length != 0){
            res.status(400).json({erro: true, retorno:erros});
        }

        total_venda += dados.frete;

        let dados_venda = {
            status: "Aguardando Pagamento",
            identificador_pagamento: uuid.v4(),
            vendedor_id: dados.vendedor,
            usuario_id: usuario_id,
            endereco_id: dados.endereco,
            valor_frete: dados.frete,
            valor_total: total_venda
        };

        let inserir_venda = sql.insert("venda", dados_venda, true);

        if(!inserir_venda){
            res.status(500).json({erro: true, retorno: [{msg:"Erro ao inserir pedido!"}]});    
        }

        let venda_id = inserir_venda;

        for(const produto_venda of verifica_produto){
            
            let dados_produto_venda = {
                venda_id: venda_id,
                produto_id: produto_venda.id,
                quantidade: produto_venda.quantidade_venda,
                valor_unitario: produto_venda.preco,
                valor_total: produto_venda.total_venda
            }

            let inserir_produto = sql.insert("venda", dados_produto_venda);

            if(!inserir_produto){
                sql._delete("venda",{id: venda_id});
                sql._delete("venda_produto", {venda_id: venda_id});

                res.status(500).json({erro: true, retorno: [{msg:"Ocorreu algum erro ao inserir a venda!"}]});
                return;
            }

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({erro: true, retorno: [{msg:"Erro interno do servidor!"}]});
    }

}

module.exports = {
    inserirVenda
}