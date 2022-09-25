const express = require("express");
const md5 = require("md5");
const sql = require("../modules/mysql");
const jwt = require("jsonwebtoken");

const login = async function(req, res){

    let dados = req.body;

    try {
        let result = await sql.execSQL("SELECT id, email, usuario, nome_vendedor, foto FROM usuario WHERE email = ? AND senha = ? and ativo = 1",[dados.email, md5(dados.senha)]);
        
        if(result.length == 0){

            res.status(404).json({erro: true, msg:"Login inválido"});

        }else{
            
            const id = result[0].id;

            const token = jwt.sign({id}, process.env.SECRET, {
                expiresIn:'30d'
            });

            res.json({erro: false, token: token, usuario: result[0]});

        }

    } catch (error) {
        
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        
    }
      
}

const registro = async function(req, res){

    let dados = req.body;
    
    try {

        let email_repetido = await sql.execSQL("SELECT * FROM usuario WHERE email = ?",[dados.email]);

        if(email_repetido.length != 0){
            return res.status(500).json({erro: true, msg:"Email já cadastrado"});
        }

        let usuario_repetido = await sql.execSQL("SELECT * FROM usuario WHERE usuario = ?",[dados.usuario]);

        if(usuario_repetido.length != 0){
            return res.status(500).json({erro: true, msg:"Nome de Usuário já cadastrado"});
        }

        dados.senha = md5(dados.senha);

        let retorno = await sql.insert("usuario", dados, true);
        
        const token = jwt.sign({retorno}, process.env.SECRET, {
            expiresIn:'30d'
        });

        delete dados.senha;

        dados.nome_vendedor = "";

        res.json({erro: false, token: token, usuario: dados});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

const dadosUsuario = async function(req, res){

    let params = req.params;

    try {

        let dados_usuario = await sql.execSQL(`SELECT email, 
                                                usuario, 
                                                COALESCE(nome_vendedor, '') as nome_vendedor, 
                                                foto, 
                                                ativo 
                                            FROM usuario WHERE id = ?`,[params.usuario_id]);

        if(dados_usuario.length == 0){
            return res.status(404).json({erro: true, msg:"Usuário não encontrado"});
        }

        return res.json({erro: false, retorno:dados_usuario});
        
    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

const alterarSenhaUsuario = async function(req, res){

    let params = {senha: md5(req.body.senha)};

    let where = {id: req.usuario};

    try {
        
        let alterar_senha = await sql.update("usuario", params, where);

        if(!alterar_senha){
            return res.status(500).json({erro: true, msg: "Erro ao alterar senha"});
        }

        res.json({erro: false, msg:"Senha Alterada com Sucesso!"});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

    

}

const cadastrarEndereco = async function(req, res){

    let dados = req.body;
    
    try {

        dados.usuario_id = req.usuario;

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
                        return res.status(500).json({erro: true, msg: "Erro ao alterar Endereço para Principal"});
                    }

                }

            }

        }

        dados.principal = (dados.principal == true ? "1" : "0");

        let retorno = await sql.insert("endereco", dados, true);

        dados.id = retorno;

        res.json({erro: false, msg: "Endereço cadastrado com Sucesso!", retorno: dados});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

const alterarEndereco = async function(req, res){

    let dados = req.body;
    
    try {

        dados.usuario_id = req.usuario;

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
                        return res.status(500).json({erro: true, msg: "Erro ao alterar Endereço para Principal"});
                    }

                }

            }

        }

        dados.principal = (dados.principal == true ? "1" : "0");

        let where = {id: req.params.endereco_id};

        let update = await sql.update("endereco", dados, where);

        if(!update){
            return res.status(500).json({erro: true, msg: "Erro ao alterar Endereço"});
        }

        dados.id = req.params.endereco_id;

        res.json({erro: false, msg: "Endereço alterado com Sucesso!", retorno: dados});

    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}


const listarEnderecosUsuario = async function(req, res){

    try {

        let enderecos = await sql.execSQL(`SELECT id,
                                                cep,
                                                uf,
                                                cidade,
                                                bairro,
                                                endereco,
                                                usuario_id,
                                                ativo,
                                                principal
                                        FROM endereco
                                        WHERE usuario_id = ?`,[req.usuario]);

        return res.json({erro: false, retorno:enderecos});
        
    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }

}

const alterarEnderecoPrincipal = async function(req, res){

    try {

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
                    return res.status(500).json({erro: true, msg: "Erro ao alterar Endereço para Principal"});
                }

            }

        }

        let update = {principal: 1};
        let where = {id: req.body.endereco_id};

        let fez_update = await sql.update("endereco", update, where);

        if(fez_update){
            res.status(500).json({erro: false, msg:"Endereço Principal alterado com Sucesso!"});
        }else{
            res.status(500).json({erro: true, msg:"Erro interno do servidor"});
        }

        
    } catch (error) {
        res.status(500).json({erro: true, msg:"Erro interno do servidor"});
    }
}

module.exports = {
    login,
    registro,
    dadosUsuario,
    alterarSenhaUsuario,
    cadastrarEndereco,
    listarEnderecosUsuario,
    alterarEndereco,
    alterarEnderecoPrincipal
}