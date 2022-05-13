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

const insert = async function(tabela, obj, retorna_id = false){

    return new Promise((resolve, reject) => {
        let campos = Object.keys(obj).toString();

        let into = Object.values(obj).toString().replace(/,/g, "','");

        let sql = `INSERT INTO ${tabela}(${campos}) VALUES ('${into}')`;

        let retorno = null;

        con.query(sql, (err, result) => {
            
            if(err){
                reject(err);
            }else{
                if(result.affectedRows != 0){
                    retorno = retorna_id ? result.insertId : true;
    
                }else{
                    retorno = false;
                }
                
                resolve(retorno);
            }

        });
    })

}

const execSQL = async function(sql, params){

    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, result) => {
           
            if(err) reject(err);
            else resolve(result);
    
        });
    })

}

module.exports = {
    con,
    insert,
    execSQL
}
