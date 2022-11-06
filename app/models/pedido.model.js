const sql = require("../../modules/mysql");

async function retorna_dados_produto(){
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

        if (busca_produtos.length == 0) {
            return false
        }

        return busca_produtos[0];

    } catch (error) {
        return false;
    }
}

module.exports = {

    dados_vendedor : async (vendedor_id) => {
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
    
            if (lista_vendedor.length != 0) {
                return lista_vendedor[0];
            }
    
            return false;
    
        } catch (error) {
            return false;
        }
    },

    verificar_produtos_venda : async (dados) => {

        let produtos_retorno = [];

        try {

            for (const produto_venda of dados.produtos) {
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

                if (dados_produto.length == 0) {
                    produtos_retorno.push({ id: produto_venda.id, existe: false, tem_estoque: true, total_venda: 0 });
                } else {
                    produtos_retorno.push(dados_produto[0]);
                }
            }

            return produtos_retorno;

        } catch (error) {
            return { msg: "Erro ao salvar pedido" };
        }

    },

    lista_pedidos : async (params) => {
        let status_filtro = "";

        if (params.status_pedido !== undefined) {
            status_filtro = ` AND v.status = '${params.status_pedido}' `;
        }

        /* 
            v = Tabela de venda
            uv = Usuario Vendedor
            uc = Usuario Comprador
        */

        return await sql.execSQL(` SELECT 
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

    },

    inserir_venda : async (dados_venda) => {

        return await sql.insert("venda", dados_venda, true);

    },

    inserir_produtos_venda : async (venda_id, produtos_venda) => {

        for (const produto_venda of produtos_venda) {

            let dados_produto_venda = {
                venda_id: venda_id,
                produto_id: produto_venda.id,
                quantidade: produto_venda.quantidade_venda,
                valor_unitario: produto_venda.preco,
                valor_total: produto_venda.valor_total
            }

            let inserir_produto = await sql.insert("venda_produto", dados_produto_venda);

            if (!inserir_produto) {
                sql._delete("venda", { id: venda_id });
                sql._delete("venda_produto", { venda_id: venda_id });
                return false;
            }

        }

        return true;

    },

    dados_pedido : async (params) => {
        let result_venda = await sql.execSQL(`SELECT
                                                    v.id,
                                                    v.status,
                                                    retornaDescricaoStatus(v.status) AS descricao_status,
                                                    v.valor_total,
                                                    v.valor_frete,
                                                    v.vendedor_id,
                                                    COALESCE(u.nome_vendedor, u.usuario) AS nome_vendedor,
                                                    e.id AS endereco_id,
                                                    vp.url as url_pagamento,
                                                    vp.status as status_mercado_pago
                                                FROM venda v
                                                INNER JOIN usuario u ON v.vendedor_id = u.id
                                                INNER JOIN endereco e ON u.id = e.usuario_id
                                                LEFT JOIN venda_pagamento as vp on vp.venda_id = v.id
                                                WHERE v.id = ?
                                                and v.usuario_id = ?`, [params.pedido_id, params.usuario_id]);

        if (result_venda.length == 0) {
            return {http: 404, erro: true, msg: "Pedido não encontrado!"};
        }

        let result_produtos = await sql.execSQL(`SELECT produto_id, quantidade, valor_unitario, valor_total FROM venda_produto WHERE venda_id = ?`, [params.pedido_id]);

        if (result_produtos.length == 0) {
            return {http: 404, erro: true, msg: "Produtos do pedido não encontrados!"};
        }

        let dados_venda = result_venda[0];

        let lista_produtos = [];

        for (const produto_venda of result_produtos) {

            let retorno_dados_produto = await retorna_dados_produto(dados_venda.vendedor_id, produto_venda.produto_id);

            if (!result_produtos.length) {
                return {http: 404, erro: true, msg: "Produto do pedido não encontrados!"};
            }

            let dados_produto = Object.assign({}, produto_venda, retorno_dados_produto);

            lista_produtos.push(dados_produto);

        }

        let endereco_entrega = await sql.execSQL(`SELECT cep, uf, cidade, bairro, endereco, numero FROM endereco WHERE id = ?`, [dados_venda.endereco_id]);

        if (endereco_entrega.length == 0) {
            return {http: 404, erro: true, msg: "Endereço de entrega não encontrado!"};
        }

        let info_adicional = {
            endereco: endereco_entrega[0],
            produtos: lista_produtos
        }

        let retorno = Object.assign({}, dados_venda, info_adicional);

        return {http: 200, erro: false, pedido: retorno};
    },
    rejeitar_frete : async (params) => {

        let _pedido = await sql.execSQL(`SELECT id, valor_frete, valor_total
                                            FROM venda 
                                            WHERE id = ? 
                                            and usuario_id = ? 
                                            and status = 'aguardando_comprador'`, [params.pedido_id, params.usuario_id]);

        if (_pedido.length == 0) {
            return {http: 404, erro: true, msg: "Pedido não encontrado"};
        }

        _pedido = _pedido[0];

        let dados_pedido = {};

        dados_pedido.status = 'aguardando_vendedor';
        dados_pedido.valor_total = _pedido.valor_total - _pedido.valor_frete;
        dados_pedido.valor_frete = 0;

        let update_pedido = await sql.update("venda", dados_pedido, { id: params.pedido_id });

        if (!update_pedido) {
            return {http: 500, erro: true, msg: "Erro ao alterar Pedido"};
        }

        return {http: 200, erro: false, msg: "Pedido alterado com sucesso!"};

    },

    begin_transaction : async () => {
        return await sql.startTransaction();
    },

    commit_transaction : async () => {
        return await sql.commit();
    },

    rollback_transaction : async () => {
        return await sql.rollback();
    },

    info_pedido : async (pedido_id, usuario_id) => {

        return await sql.execSQL(`SELECT id, 
                            valor_frete, 
                            valor_total,
                            identificador_pagamento
                    FROM venda 
                    WHERE id = ? 
                    and usuario_id = ? 
                    and status = 'aguardando_comprador'`, [pedido_id, usuario_id]);
    },

    produtos_venda : async (pedido_id, usuario_id) => {

        return await sql.execSQL(`SELECT vp.produto_id, p.sku, p.fotos, p.titulo, p.descricao, vp.quantidade, vp.valor_unitario, vp.valor_total 
                                    FROM venda_produto vp
                                    INNER JOIN venda v on v.id = vp.venda_id
                                    INNER JOIN produto p on p.id = vp.produto_id
                                    WHERE vp.venda_id = ?
                                    and v.usuario_id = ?`, [pedido_id, usuario_id]);

    },

    comprador_venda : async (pedido_id) => {

        return await sql.execSQL(`SELECT u.*, 
                                    e.cep,
                                    e.uf,
                                    e.cidade,
                                    e.bairro,
                                    e.endereco,
                                    e.numero,
                                    retornaNomeEstado(e.uf) as estado  FROM venda v 
                                    INNER JOIN usuario u on u.id = v.usuario_id
                                    INNER JOIN endereco e on e.id = v.endereco_id
                                    WHERE v.id = ?`, [pedido_id]);

    },

    inserir_pagamento : async (objPagto) => {
        
        let conflict = {
            url: objPagto.url,
            dados_criacao: objPagto.dados_criacao,
            status: 'pending'
        }

        let str_update = ' ultima_alteracao = now() ';

        return await sql.insert("venda_pagamento", objPagto, true, conflict, str_update);

    },

    alterar_status_pedido : async (pedido_id, status) => {

        let update = {
            status: status
        };

        let where = {
            id: pedido_id
        };

        console.log(update);
        console.log(where);

        return await sql.update("venda", update, where);

    },

    salva_dados_pagamento : async(retorno_mp) => {

        try {

            let referencia_externa = retorno_mp.external_reference;

            let busca_pedido_foodsupply = await sql.execSQL("SELECT venda_id FROM venda_pagamento WHERE referencia_externa = ?", [referencia_externa]);

            if (busca_pedido_foodsupply.length == 0) {
                return {http: 404, erro: true, msg: "Pedido não encontrado"};
            }
    
            pedido_foodsupply = busca_pedido_foodsupply[0];

            let update_mp = {
                callback: JSON.stringify(retorno_mp),
                status: retorno_mp.status,
                data_alteracao: moment().utcOffset(-3).format('YYYY-MM-DD HH:mm:ss'),
            };

            let where_mp = {
                referencia_externa
            };

            let status = "";

            switch (retorno_mp.status) {
                case 'approved':
                    status = 'pagamento_aprovado';
                    break;

                case 'authorized':
                case 'in_process':
                case 'in_mediation':
                    status = "processando_pagamento";
                    break;

                case 'rejected':
                    status = 'pagamento_rejeitado';
                    break;

                case 'cancelled':
                    status = 'pagamento_cancelado';
                    break;

                case 'refunded':
                case 'charged_back':
                    status = 'pagamento_extornado';
                    break;

            }

            await this.begin_transaction();

            let update_pagamento = await sql.update("venda_pagamento", update_mp, where_mp);

            if(!update_pagamento){

                await this.rollback_transaction();

                return {http: 400, erro: true, msg: "Não foi possível alterar o status do pagamento"};
            }

            await sql.update("venda", {status}, {id: pedido_foodsupply.venda_id});

            if(!update_pagamento){

                await this.rollback_transaction();

                return {http: 400, erro: true, msg: "Não foi possível alterar o status da venda"};
            }

            await this.commit_transaction();

            return {http: 200, msg:"Pagamento atualizado com sucesso"};
        
        } catch (error) {
            this.rollback_transaction();
            return false;
        }
    }
};