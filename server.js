const express = require("express");
// const bodyParser = require("body-parser");
require("dotenv-safe").config()
// const jwt = require("jsonwebtoken")
const app = express();

const porta = 3001;

let usuario = require("./routes/Usuario");
let produto = require("./routes/Produto");

app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use("/", usuario);
app.use("/", produto);
 
app.listen(porta, ()=>{

    console.log(`Servidor iniciado na porta ${porta}`)

});