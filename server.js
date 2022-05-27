const express = require("express");
// const bodyParser = require("body-parser");
require("dotenv-safe").config()
// const jwt = require("jsonwebtoken")
const app = express();

const porta = 3001;

let usuario = require("./routes/Usuarios");
let produto = require("./routes/Produtos");
let vendedor = require("./routes/Vendedores");
let pedidos = require("./routes/Pedidos");
let vendas = require("./routes/Vendas");

app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use("/", usuario);
app.use("/", produto);
app.use("/", vendedor);
app.use("/", pedidos);
app.use("/", vendas);
 
app.listen(porta, ()=>{

    console.log(`Servidor iniciado na porta ${porta}`)

});