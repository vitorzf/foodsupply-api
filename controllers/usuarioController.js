const express = require("express");
const md5 = require("md5");
const sql = require("../modules/mysql");
const jwt = require("jsonwebtoken");
const funcoes = require("../funcoes");

const router = express.Router();

router.post("/login", (req, res) => {
    
    let dados = req.body;

    sql.query("SELECT * FROM usuario WHERE email = ? AND senha = ?",[dados.login, md5(dados.senha)], (err, result) => {
        if(result.length == 0){
            res.sendStatus(404);
            res.json({erro: true});
        }else{
            
            const id = result[0].id;

            const token = jwt.sign({id}, process.env.SECRET, {
                expiresIn:7000
            });

            return res.json({erro: false, token: token});

        }
    })

});

router.get("/login", funcoes.autenticado, (req, res, next) => {
    console.log(123);
});

router.post("/logout", (req, res) => {
    res.json({erro: false, token: null});
})

module.exports = router;