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

        // let into = Object.values(obj).toString().replace(/,/g, "','");

        let values = "";
        let into = "";

        Object.values(obj).forEach(value => {
            into += `'${value}',`;
        });

        values = into.slice(0, -1);

        let sql = `INSERT INTO ${tabela}(${campos}) VALUES (${values})`;

        let retorno = null;

        con.query(sql, (err, result) => {
            
            if(err){
                console.log(`Erro ao executar SQL\n SQL: ${err.sql}\n Mensagem: ${err.sqlMessage}`);
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

const _delete = async function (tabela, condicao){
    return new Promise((resolve, reject) => {

        let where = "";
        let sql = "";

        Object.keys(condicao).forEach(function(key) {
            
            if(where.length != 0){
                where += " AND ";
            }

            where += `${key} = '${condicao[key]}'`;

        });

        set = set.slice(0, -1);
        
        sql = `DELETE FROM ${tabela} WHERE ${where}`;

        let retorno = null;

        con.query(sql, (err, result) => {
            
            if(err){
                console.log(`Erro ao executar SQL\n SQL: ${err.sql}\n Mensagem: ${err.sqlMessage}`);
                reject(err);
            }else{

                if(result.affectedRows != 0){
                    
                    retorno = true;
    
                }else{
                    retorno = false;
                }

                resolve(retorno);
            }

        });

    });
}

const update = async function (tabela, params, condicao){

    return new Promise((resolve, reject) => {

        let set = "";
        let where = "";
        let sql = "";

        Object.keys(params).forEach(function(key) {
            
            set += `${key} = '${params[key]}',`;

        });

        Object.keys(condicao).forEach(function(key) {
            
            if(where.length != 0){
                where += " AND ";
            }

            where += `${key} = '${condicao[key]}'`;

        });

        set = set.slice(0, -1);
        
        sql = `UPDATE ${tabela} SET ${set} WHERE ${where}`;

        let retorno = null;

        con.query(sql, (err, result) => {
            
            if(err){
                console.log(`Erro ao executar SQL\n SQL: ${err.sql}\n Mensagem: ${err.sqlMessage}`);
                reject(err);
            }else{

                if(result.affectedRows != 0){
                    
                    retorno = true;
    
                }else{
                    retorno = false;
                }

                resolve(retorno);
            }

        });

    });

}

const execSQL = async function(sql, params = {}){

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
    update,
    _delete,
    execSQL
}
