"use strict";
// const jwt = require("jsonwebtoken");
const { decrypt } = require('../app/services/crypt.service')

module.exports = {
    auth : (req, res, next) => {
        let token = req.headers['x-token'];

        if(token === undefined){
            res.status(401).json({erro: true, msg: "Token necessário!"});
            return;
        }

        try {
            token = token.split(":");

            console.log("tamanho", token.length);
    
            if(token.length != 2){
                res.status(401).json({erro: true, msg: "Token inválido!"});
                return;
            }
    
            let hash = {
                iv: token[0],
                content: token[1]
            };
    
            let retorno = decrypt(hash);

            req.usuario = retorno;
    
            next();
    
        } catch (error) {
            res.status(400).json({erro: true, msg: "Erro ao validar Token"});
            return;
        }

    }
}
