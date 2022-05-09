"use strict";
import create from './service/create'

const express = require("express");
const jwt = require("jsonwebtoken");

async function autenticado = function autenticado(req, res, next){
    const token = req.headers['x-token'];
    if(!token){
        res.sendStatus(401).json({erro: true, msg: "Token necessário!"});
    }

    await jwt.verify(token, process.env.SECRET, function(err, decoded){

        if(err){
            res.json({erro: true, msg: "Erro interno do servidor!"}).sendStatus(500);
        }

        if(decoded === undefined){
            res.json({erro: true, msg: "Token inválido!"}).sendStatus(401);
        }
        
        req.userId = decoded.id;
        next();
    });
};
module.exports = {
    autenticado
}
