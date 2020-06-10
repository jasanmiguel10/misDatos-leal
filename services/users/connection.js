const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: '',
    password: '',
    database: 'mis_datos',
    multipleStatements: true
});

let mis_datos = {};

mis_datos.registerUser = (values) =>{
    var sql = "INSERT INTO users (user_id, created_date, name, lastname, birth_date, email, password) VALUES (?)";
    return new Promise((resolve, reject) =>{
        pool.query(sql,[values],(err, res)=>{
            if(err) return reject(err);
            return resolve(res);
        });
    });
}

mis_datos.login = (user_id) => {
    var sql = "SELECT password FROM mis_datos.users WHERE(user_id = ?)";
    return new Promise((resolve, reject) => {
        pool.query(sql, user_id, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}
mis_datos.getTransactionHistory = (userId) => {
    var sql = "SELECT * FROM transactions WHERE(user_id = ?) ORDER BY created_date DESC";
    return new Promise((resolve, reject) => {
        pool.query(sql, userId, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}
mis_datos.getPoints = (userId) => {
    var sql = "SELECT SUM(points) AS totalPoints FROM transactions WHERE(user_id = ?)";
    return new Promise((resolve, reject) => {
        pool.query(sql, userId, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}
mis_datos.exportTransactionsToExcel = (userId) => {
    var sql = "SELECT * FROM transactions WHERE(user_id = ?)";
    return new Promise((resolve, reject) => {
        pool.query(sql, userId, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}
module.exports = mis_datos;