const sql = require("../modules/mysql");
const md5 = require("md5");

module.exports = {
    login : async (dados) => {

        return await sql.execSQL("SELECT id, email, usuario, nome_vendedor, foto FROM usuario WHERE email = ? AND senha = ? and ativo = 1",[dados.email, md5(dados.senha)]);

    },
    checagens_registro : async (dados) => {

        let email_repetido = await sql.execSQL("SELECT * FROM usuario WHERE email = ?",[dados.email]);

        if(email_repetido.length != 0){
            return {erro:true, msg: "Email já cadastrado anteriormente"};
        }

        let usuario_repetido = await sql.execSQL("SELECT * FROM usuario WHERE usuario = ?",[dados.usuario]);

        if(usuario_repetido.length != 0){
            return {erro:true, msg: "Nome de Usuário já cadastrado"};
        }

        return {erro: false};
    },
    dados_usuario : async (params) => {

        let dados_usuario = await sql.execSQL(`SELECT email, 
                                                usuario, 
                                                COALESCE(nome_vendedor, '') as nome_vendedor, 
                                                foto, 
                                                ativo 
                                            FROM usuario WHERE id = ?`,[params.usuario_id]);

        return dados_usuario;                                            

    },
    alterar_senha : async (params, where) => {
        
        let alterar_senha = await sql.update("usuario", params, where);

        if(!alterar_senha){
            return {erro: true, msg: "Erro ao alterar senha"};
        }

        return {erro: false, msg:"Senha Alterada com Sucesso!"};

    },

    cadastrar_endereco : async (req, dados) => {
        if(dados.principal){
            
            let lista_enderecos_usuario = await sql.execSQL("SELECT * FROM endereco WHERE usuario_id = ?", [req.usuario]);
                
            if(lista_enderecos_usuario.length != 0){

                let enderecos_principais = [];

                lista_enderecos_usuario.forEach(endereco => {

                    if(endereco.principal == 1){
                        enderecos_principais.push(endereco.id);
                    }

                });

                if(enderecos_principais.length != 0){

                    let txt_sql = `UPDATE endereco SET principal = 0 WHERE id in (${enderecos_principais.toString()})`;
                    
                    let alterar_endereco = await sql.execSQL(txt_sql);

                    if(!alterar_endereco){
                        return {erro: true, msg: "Erro ao alterar Endereço para Principal"};
                    }

                }

            }

        }

        dados.principal = (dados.principal == true ? "1" : "0");

        let retorno = await sql.insert("endereco", dados, true);

        dados.id = retorno;

        return {erro: false, retorno: dados};
    },

    alterar_endereco : async (req, dados) => {

        if(dados.principal){
            
            let lista_enderecos_usuario = await sql.execSQL("SELECT * FROM endereco WHERE usuario_id = ?", [req.usuario]);
                
            if(lista_enderecos_usuario.length != 0){

                let enderecos_principais = [];

                lista_enderecos_usuario.forEach(endereco => {

                    if(endereco.principal == 1){
                        enderecos_principais.push(endereco.id);
                    }

                });

                if(enderecos_principais.length != 0){

                    let txt_sql = `UPDATE endereco SET principal = 0 WHERE id in (${enderecos_principais.toString()})`;
                    
                    let alterar_endereco = await sql.execSQL(txt_sql);

                    if(!alterar_endereco){
                        return {erro: true, msg: "Erro ao alterar Endereço para Principal"};
                    }

                }

            }

        }

        dados.principal = (dados.principal == true ? "1" : "0");

        let where = {id: req.params.endereco_id};

        let update = await sql.update("endereco", dados, where);

        if(!update){
            return {erro: true, msg: "Erro ao alterar Endereço"};
        }

        dados.id = req.params.endereco_id;

        return {erro: false, retorno: dados};

    },

    lista_enderecos : async (usuario_id) => {
        return await sql.execSQL(`SELECT id,
                                                    cep,
                                                    uf,
                                                    cidade,
                                                    bairro,
                                                    endereco,
                                                    usuario_id,
                                                    ativo,
                                                    principal
                                            FROM endereco
                                            WHERE usuario_id = ?`,[usuario_id]);
    },

    alterar_endereco_principal : async (req) => {

        let lista_enderecos_usuario = await sql.execSQL("SELECT * FROM endereco WHERE usuario_id = ?", [req.usuario]);
            
        if(lista_enderecos_usuario.length != 0){

            let enderecos_principais = [];

            lista_enderecos_usuario.forEach(endereco => {

                if(endereco.principal == 1){
                    enderecos_principais.push(endereco.id);
                }

            });

            if(enderecos_principais.length != 0){

                let txt_sql = `UPDATE endereco SET principal = 0 WHERE id in (${enderecos_principais.toString()})`;
                
                let alterar_endereco = await sql.execSQL(txt_sql);

                if(!alterar_endereco){
                    return {erro: true, msg: "Erro ao alterar Endereço para Principal"};
                }

            }

        }

        let update = {principal: 1};
        let where = {id: req.body.endereco_id};

        let fez_update = await sql.update("endereco", update, where);

        if(fez_update){
            return {erro: false, msg: "Endereço principal alterado com sucesso!"};
        }else{
            return {erro: true, msg:"Erro interno do servidor"};
        }

    }
}