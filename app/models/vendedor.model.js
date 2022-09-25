const sql = require("../../modules/mysql");

module.exports = {
    definir_nome : async (usuario_id, dados) => {
        let update = await sql.update("usuario", dados, {id: usuario_id});    
        
        if(update){
            return {erro: false}
        }
        
        return {erro: true};
    },

    lista_todos_vendedores : async () => {
        return await sql.execSQL(`SELECT
                                                u.id,
                                                u.email,
                                                u.usuario,
                                                u.nome_vendedor,
                                                u.foto
                                            FROM usuario u
                                            INNER JOIN produto p on u.id = p.usuario_id
                                            WHERE u.ativo = 1`);
    }
}