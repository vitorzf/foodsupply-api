const express = require("express");
require("dotenv-safe").config();

const app = express();

// const porta = 3001;
const porta = process.env.PORT || 3001; 

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
 
process.on('uncaughtException', (error, origin) => {
    if (error?.code === 'ECONNRESET') return;
    console.error('UNCAUGHT EXCEPTION');
    console.error(error);
    console.error(origin);
    process.exit(1);
});

app.listen(porta, ()=>{

    console.log(`Servidor iniciado na porta ${porta}`)

});