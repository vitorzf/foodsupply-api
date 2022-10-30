const sql = require("../../modules/mysql");

module.exports = {
    lista_vendas : async (usuario_id, filtro) => {
         /* 
            v = Tabela de venda
            uv = Usuario Vendedor
            uc = Usuario Comprador
        */

        return await sql.execSQL(` SELECT 
                                        v.id,
                                        v.status,
                                        retornaDescricaoStatus(v.status) as descricao_status,
                                        v.valor_frete,
                                        v.valor_total
                                    FROM venda v
                                    INNER JOIN usuario uv ON uv.id = v.vendedor_id
                                    INNER JOIN usuario uc ON uc.id = v.usuario_id
                                    WHERE v.vendedor_id = ?
                                    ${filtro}`, [usuario_id]);
    },

    dados_venda : async (usuario_id, venda_id) => {

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
                                            and v.vendedor_id = ?`, [venda_id, usuario_id]);

        if(result_venda.length == 0){
            return {erro: true, msg:"Pedido não encontrado!"};
        }

        let result_produtos = await sql.execSQL(`SELECT produto_id, quantidade, valor_unitario, valor_total FROM venda_produto WHERE venda_id = ?`, [venda_id]);

        if(result_produtos.length == 0){
            return {erro: true, msg:"Produtos do pedido não encontrados!"};
        }

        let dados_venda = result_venda[0];
        let lista_produtos = result_produtos;

        let endereco_entrega = await sql.execSQL(`SELECT cep, uf, cidade, bairro, endereco, numero FROM endereco WHERE id = ?`, [dados_venda.endereco_id]);

        if(endereco_entrega.length == 0){
            return {erro: true, msg:"Endereço de entrega não encontrado!"};
        }

        let info_adicional = {
            endereco: endereco_entrega[0],
            produtos: lista_produtos
        }

        const retorno = Object.assign({}, dados_venda, info_adicional);

        return {erro: false, pedido: retorno};

    },

    confirmar_venda : async (usuario_id, venda_id) => {

        let _pedido = await sql.execSQL(`SELECT id FROM venda  WHERE id = ? and vendedor_id = ?`,[venda_id, usuario_id]);

        if(_pedido.length == 0){
            return {erro: true, http: 404, retorno: [{msg: "Pedido não encontrado"}]};
        }
        
        let lista_produtos_pedido = await sql.execSQL(`SELECT 
                                                            vp.*,
                                                            p.usuario_id as vendedor
                                                        FROM venda_produto vp 
                                                        INNER JOIN produto p on p.id = vp.produto_id
                                                        WHERE vp.venda_id = ?`, [venda_id]);

        if(lista_produtos_pedido.length == 0){
            return {erro: true, http: 400, retorno: [{msg: "Nenhum produto encontrado"}]};
        }

        let busca_dados_pedido = await sql.execSQL("SELECT * FROM venda WHERE id = ?", [venda_id]);

        let dados_pedido = busca_dados_pedido[0];

        dados_pedido.status = 'aguardando_comprador';

        //Caso o valor do frete ja tenha sido enviado anteriormente, ele remove o total do frete atual
        //define o novo valor de frete e recalcula posteriormente o total do pedido
        if(dados_pedido.valor_frete != 0){
            dados_pedido.valor_total = dados_pedido.valor_total - dados_pedido.valor_frete;
            dados_pedido.valor_frete = 0;
        }

        dados_pedido.valor_total = dados_pedido.valor_total + params.frete;
        dados_pedido.valor_frete = params.frete;

        let update_pedido = await sql.update("venda", dados_pedido, {id: venda_id});

        if(!update_pedido){
            return {erro: true, http:400, msg:"Erro ao alterar Pedido"};
        }
        
        return {erro: false, msg:"Pedido alterado com sucesso!"};

    }
};