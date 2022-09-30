var con = require("./mysql_pool");

module.exports = {
    con,
    startTransaction : async () => {
        con.beginTransaction()
    },
    rollback : async () => {
        con.rollback();
    },
    commit : async () => {
        con.commit();
    },
    insert : async (tabela, obj, retorna_id = false) => {
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
        });
    },
    update : async (tabela, params, condicao) => {
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
    },
    _delete : async (tabela, condicao) => {
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
    },
    execSQL : async (sql, params = {}) => {
        return new Promise((resolve, reject) => {
            con.query(sql, params, (err, result) => {
               
                if(err) reject(err);
                else resolve(result);
        
            });
        }).catch((error) => {
            console.log("erro de sql");
            console.log(error);
        });
    }
}
