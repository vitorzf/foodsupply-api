

// LOCALHOST
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     database: "foodsupply",
//     password: ""
// });

var mysql = require('mysql');


var pool = mysql.createPool({
    host: "45.132.157.52",
    user: "u114347885_foodsupply",
    database: "u114347885_foodsupply",
    password: "QS$dyto?$4*m"
});

pool.getConnection((err,connection)=> {
  if(err)
  throw err;
  console.log('Conexão com o Banco de Dados efetuada');
  connection.release();
});

module.exports = pool;