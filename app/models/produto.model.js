const sql = require("../../modules/mysql");

async function listaProduto(produto_id, usuario_id){
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

        let busca_produtos = await sql.execSQL(txtSql, [produto_id, usuario_id]);

        if(busca_produtos.length == 0){
            return null
        }

        return busca_produtos[0];
        
    } catch (error) {
        return error;
    }

}

module.exports = {

    cadastrar_produto : async (usuario_id, produto) => {

        let busca_produto_existente = await sql.execSQL(
            "SELECT id FROM produto WHERE sku = ? AND usuario_id = ?",
            [produto.sku, usuario_id]
        );
        
        if(busca_produto_existente.length != 0){

            return {http: 400, erro: true, msg: `SKU ${produto.sku} já cadastrado para o usuário`};

        }

        let produto_id = await sql.insert("produto", produto, true);

        if(produto_id.length == 0){
            
            return {http: 400, erro: true, msg: "Erro ao cadastrar Produto!"};

        }

        return {http: 200, erro: false, produto_id: produto_id};

    },

    atualizar_produto : async (produto_id, usuario_id, produto) => {

        let busca_produto_existente = await sql.execSQL(
            "SELECT id FROM produto WHERE sku = ? AND usuario_id = ?",
            [produto.sku, usuario_id]
        );
        
        if(busca_produto_existente.length == 0){

            return {http: 404, erro: true, msg:`Produto não encontrado`};
    
        }

        let condicao = {
            id: produto_id,
            usuario_id: usuario_id
        };

        let atualizar = await sql.update("produto", produto, condicao);

        if(!atualizar){

            return {http: 400, erro: true, msg:"Erro ao atualizar Produto!"};
            
        }
            
        return {http: 200, erro: false, msg:"Produto Atualizado com Sucesso!", produto_id: produto_id};

    },

    atualizar_dados_produto : async (produto_id, usuario_id, produto) => {
        let busca_produto_existente = await sql.execSQL(
            "SELECT id FROM produto WHERE id = ? AND usuario_id = ?",
            [produto_id, usuario_id]
        );
        
        if(busca_produto_existente.length == 0){
    
            return {http: 404, erro: true, msg:"Produto não encontrado"};
    
        }

        let condicao = {
            id: produto_id,
            usuario_id: usuario_id
        };

        let atualizar = await sql.update("produto", produto, condicao);

        if(!atualizar){

            return {http: 400, erro: true, msg:"Erro ao atualizar Produto!"};

        }

        dados_produto = await listaProduto(produto_id, usuario_id);

        if(typeof(dados_produto) != "object"){
            return {http: 400, erro: true, msg:"Erro ao atualizar Produto!"};
        }

        return {http: 200, msg: "Produto Atualizado com Sucesso!", produto: dados_produto};

    },

    lista_unidades_medida : async () => {

        return await sql.execSQL("SELECT * FROM unidade_medida");

    },

    lista_categorias : async () => {

        return await sql.execSQL("SELECT * FROM categorias ORDER BY nome ASC");

    },

    lista_todos_produtos : async (filtros) => {
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
                        ${filtros}`;

        let busca_produtos = await sql.execSQL(txtSql);

        let retorno = [];

        for(const produto of busca_produtos){
            
            let fotos = JSON.parse(produto.fotos);

            produto.fotos = fotos;

            retorno.push(produto);

        }

        return retorno;
    },

    lista_dados_produto : async (produto_id) => {

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
                        and p.id = '${produto_id}'`;

        let busca_produtos = await sql.execSQL(txtSql);

        let retorno = [];

        for(const produto of busca_produtos){
            
            let fotos = JSON.parse(produto.fotos);

            produto.fotos = fotos;

            retorno.push(produto);

        }

        return retorno;

    },

    lista_produtos_vendedor : async (dados) => {

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
                            um.nome as unidade_medida_nome
                        FROM produto p
                        INNER JOIN usuario u ON u.id = p.usuario_id
                        INNER JOIN categorias c ON c.id = p.categoria_id
                        INNER JOIN unidade_medida um ON um.id = p.medida_id
                        WHERE p.ativo = 1
                        and p.usuario_id = ?`;
        
        return await sql.execSQL(txtSql, [dados.vendedor_id]);

    }

};