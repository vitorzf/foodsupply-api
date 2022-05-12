"use strict";
const express = require("express");
const jwt = require("jsonwebtoken");

module.exports.autenticado = function autenticado(req, res, next){
    const token = req.headers['x-token'];
    if(!token){
        res.sendStatus(401).json({erro: true, msg: "Token necessário!"});
    }

    jwt.verify(token, process.env.SECRET, function(err, decoded){

        if(err){
            res.status(500).json({erro: true, msg: "Token inválido!"});
        }

        if(decoded === undefined){
            res.status(401).json({erro: true, msg: "Token inválido!"});
        }
        
        next(decoded.id);
    });
};