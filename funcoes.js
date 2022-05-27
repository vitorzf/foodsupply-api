"use strict";
const express = require("express");
const jwt = require("jsonwebtoken");

const autenticado = function autenticado(req, res){
    const token = req.headers['x-token'];

    if(!token){
        res.status(401).json({erro: true, msg: "Token necessário!"});
        return;
    }

    jwt.verify(token, process.env.SECRET, function(err, decoded){

        if(err){
            res.status(401).json({erro: true, msg: "Sem autorização!"});
            return;
        }
        
        req.usuario = decoded.id;

    });
};

module.exports = {
    autenticado
}
