const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: '',
    password: '',
    database: 'mis_datos',
    multipleStatements: true
});

let mis_datos = {};

mis_datos.createTransaction = (values) => {
    var sql = "INSERT INTO transactions (user_id, created_date ,value, points) VALUES (?)";
    return new Promise((resolve, reject) => {
        pool.query(sql, [values], (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}

mis_datos.inactivateTransation = (transactionId) => {
    var sql = "UPDATE transactions SET status = '0' WHERE(transaction_id = ?)";
    return new Promise((resolve, reject) => {
        pool.query(sql, transactionId, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
}


module.exports = mis_datos;

