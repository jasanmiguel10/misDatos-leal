//Load express
const express = require('express');
const bodyParse = require('body-parser');
const app = express();
const validator = require('validator');
const md5 = require('md5');
app.use(bodyParse.json())
const port = 3030;
//database
const connection = require('./connection');

app.listen(port, () => {
    console.log('Service running in port', port);
});
app.post('/createTransaction', async(req, res) => {
    const newTransaction = req.body;
    const email = newTransaction.email;
    const value = newTransaction.value;
    const points = newTransaction.points;
    const dateCreated = newTransaction.created_date;
    if (!email) {
        res.status(400).send("No user id was given");
        return;
    }
    if (!value) {
        res.status(400).send("No value was given");
        return;
    }
    if (!points) {
        res.status(400).send("No amout of points was given");
        return;
    }
    if (!dateCreated) {
        res.status(400).send("No amout of points was given");
        return;
    }
    //Format validation
    if (!validator.isEmail(email)) {
        res.status(400).send("The email is wrongly formated");
        return;
    }    
    if (!validator.isNumeric(points +"")) {
        res.status(400).send("The points parameteris wrongly formated");
        return;
    }

    if (!validator.isNumeric(value + "")) {
        res.status(400).send("The value parameteris wrongly formated");
        return;
    }
    if (!validator.isISO8601(dateCreated)) {
        res.status(400).send("The birth date is wrongly formated");
        return;
    }

    //get additional data
    const userID = md5(email);
    let values = [userID,dateCreated,value,points];
    try {
        await connection.createTransaction(values);
        res.status(201).send('Transaction created');
    } catch (e) {
        res.status(500).send('Somenthing went wrong, try again')
    }
});
app.put('/inactivateTransaction', async (req, res) => {
    const transactionId = req.body.transaction_id;
    //Validacion inicial de datos enviados
    if (!transactionId) {
        res.status(400).send("No transaction id was given");
        return;
    }
    try {
        await connection.inactivateTransation(transactionId);
        res.status(200).send('Satus inactivated for transaction ' + transactionId);
    } catch (e) {
        res.status(500).send('Somenthing went wrong, try again')
    }
});