const express = require("express");
const md5 = require("md5");
const sql = require("../modules/mysql");
const jwt = require("jsonwebtoken");
const funcoes = require("../funcoes");

const router = express.Router();

router.post("/login", (req, res) => {
    
    let dados = req.body;

    sql.query("SELECT * FROM usuario WHERE email = ? AND senha = ?",[dados.email, md5(dados.senha)], (err, result) => {
        if(result.length == 0){

            res.status(404).json({erro: true, msg:"Login inválido"});
        }else{
            
            const id = result[0].id;

            const token = jwt.sign({id}, process.env.SECRET, {
                expiresIn:'30d'
            });

            res.json({erro: false, token: token});

        }
    })

});

router.get("/login", funcoes.autenticado, (req, res, next) => {
    console.log(next);
});

router.post("/registro", (req, res) =>  {

    let dados = req.body;
    
    let retorno = await sql.insert("usuario", dados, true);

    console.log(retorno);

})

router.post("/logout", (req, res) => {
    res.json({erro: false, token: null});
});

module.exports = router;