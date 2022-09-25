"use strict";
const jwt = require("jsonwebtoken");

module.exports = {
    auth : (req, res, next) => {
        const token = req.headers['x-token'];

        if(token === undefined){
            res.status(401).json({erro: true, msg: "Token necessário!"});
            return;
        }

        jwt.verify(token, process.env.SECRET, function(err, decoded){
    
            if(err){
                res.status(401).json({erro: true, msg: "Sem autorização!"});
                return;
            }
    
            req.usuario = decoded.id;
    
            next();
    
        });

    }
}
