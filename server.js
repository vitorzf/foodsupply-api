const moment = require("moment");

console.log("HORARIO DE INÍCIO DO SERVIDOR ->", moment().utcOffset(-3).format('YYYY-MM-DD HH:mm:ss'));

// console.log(new Date().toUTCString('en-US', {timeZone: 'America/Sao_Paulo'}).replace(/T/, ' ').replace(/\..+/, ''),);

require("dotenv-safe").config();
const express = require("express");
const cors = require('cors');

const app = express();

// const porta = 3001;
const porta = process.env.PORT || 3001; 

let usuario = require("./routes/Usuarios");
let produto = require("./routes/Produtos");
let vendedor = require("./routes/Vendedores");
let pedidos = require("./routes/Pedidos");
let vendas = require("./routes/Vendas");
let mercadopago = require("./routes/Mercadopago");

app.use(cors({
    origin: '*'
}));

app.use(express.json()); 
app.use(express.urlencoded({extended: true}));
app.use("/", usuario);
app.use("/", produto);
app.use("/", vendedor);
app.use("/", pedidos);
app.use("/", vendas);
app.use("/", mercadopago);
 
// process.on('uncaughtException', (error, origin) => {
//     if (error?.code === 'ECONNRESET') return;
//     console.error('UNCAUGHT EXCEPTION');
//     console.error(error);
//     console.error(origin);
//     process.exit(1);
// });

app.listen(porta, ()=>{

    console.log(`Servidor iniciado na porta ${porta}`)

});