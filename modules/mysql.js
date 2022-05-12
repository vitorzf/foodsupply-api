const mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "foodsupply",
    password: ""
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = con;

module.exports.insert = async function insert(tabela, obj, retorna_id = false){

    let campos = Object.keys(obj).toString();
    let into = Object.values(obj).toString().replace(/,/g, "','");

    let sql = `INSERT INTO ${tabela}(${campos}) VALUES ('${into}')`;

    let retorno = null;

        await con.query(sql, (err, result) => {
        
        if(result.affectedRows != 0){
            console.log(result.insertId);
            retorno = retorna_id ? result.insertId : true;

        }else{
            console.log("erro ao dar insert");
            retorno = false;
        }

    });

    return retorno;

}

