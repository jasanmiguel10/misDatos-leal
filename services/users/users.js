//Load express
const express = require('express');
const bodyParse = require('body-parser');
const app = express();
const validator = require('validator');
const md5 = require('md5');
app.use(bodyParse.json())
const port = 3000;
//database
const connection = require('./connection');

//Excel
const xl = require('excel4node');
const fs = require('fs')

app.listen(port, () => {
    console.log('Service running in port', port);
});

app.post('/register', async(req, res)=>{
    const newUser = req.body;
    const name = newUser.name;
    const lastname = newUser.lastname;
    const birthDate = newUser.birth_date;
    const email = newUser.email;
    const pass = newUser.password;

    //Primero se verifica que todos los campos requeridos esten en el body.
    if(!name){
        res.status(400).send("No Name was given");
        return;
    }
    if (!lastname) {
        res.status(400).send("No lastname was given");
        return;
    }
    if (!birthDate) {
        res.status(400).send("No birth date was given");
        return;
    }
    if (!email) {
        res.status(400).send("No email was given");
        return;
    }
    if (!pass) {
        res.status(400).send("No password was given");
        return;
    }
    //despues se verifica que los campos esten correctamente formateados.
    //Validacion de nombre
    if (!validator.isAscii(name)){
        res.status(400).send("The name is wrongly formated");
        return;
    }
    //validacon de apellido
    if (!validator.isAscii(lastname)) {
        res.status(400).send("The lastname is wrongly formated");
        return;
    }
    //validacion de fecha de nacimiento
    if (!validator.isISO8601(birthDate)){
        res.status(400).send("The birth date is wrongly formated");
        return;
    }
    //Validacion correo electronico
    if (!validator.isEmail(email)) {
        res.status(400).send("The email wrongly formated");
        return;
    }
    //Validacion de contraseña debe ser alphanumerica y de 6 caracteres
    if (!(validator.isAlphanumeric(pass))) {
        res.status(400).send("The password wrongly formated");
        return;
    }
    if (!(validator.isLength(pass,[6,14]))) {
        res.status(400).send("The password must be between 6 and 14 characters long");
        return;
    }
    //Todos los campos son validos, ahora hasheamos contraseña, sacamos created date y userid.
    const userId = md5(email);
    const passToSave = md5(pass);
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateCreated = date + ' ' + time;

    //Save into database
    const values = [userId, dateCreated, name, lastname, birthDate, email, passToSave];
    try{
        await connection.registerUser(values);
        res.status(200).send('User Created')
    } catch(e){
        if (e.sqlMessage == ("Duplicate entry '"+ userId +"' for key 'users.PRIMARY'")){
            res.status(201).send('Mail ' + email + ' already registered')
        }
        else{
            res.status(500).send('Somenthing went wrong, try again')
        }
    }
});



app.post('/login', async(req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    //Validacion inicial de datos enviados
    if (!email) {
        res.status(400).send("No email was given");
        return;
    }
    if (!pass) {
        res.status(400).send("No password was given");
        return;
    }
    //Validacion de contraseña y mail debe ser alphanumerica y de 6 caracteres
    if (!validator.isEmail(email)) {
        res.status(400).send("The email wrongly formated");
        return;
    }
    if (!(validator.isAlphanumeric(pass))) {
        res.status(400).send("The password wrongly formated");
        return;
    }
    if (!(validator.isLength(pass, [6, 14]))) {
        res.status(400).send("The password must be between 6 and 14 characters long");
        return;
    }
    const encriptedPass = md5(pass);
    const userId = md5(email);
    try {
        let answer = await connection.login(userId);
        if(answer.length == 0){
            res.status(400).send("Email not registered");
        }
        else if (answer[0].password === encriptedPass){
            res.status(200).send("Correct credentials");
        }else{
            res.status(400).send("Incorrect conbination email/password");
        }
    } catch (e) {
        res.status(500).send('Somenthing went wrong, try again')
    }

});

app.get('/getTransactionHistory', async (req, res) => {
    const email = req.body.email;
    //Validacion inicial de datos enviados
    if (!email) {
        res.status(400).send("No email was given");
        return;
    }
    if (!validator.isEmail(email)) {
        res.status(400).send("The email wrongly formated");
        return;
    }
    const username = md5(email);
    try {
        let answer = await connection.getTransactionHistory(username);
        if (answer.length == 0) {
            res.status(400).send("No transactions for the given email");
        }
        else {
            res.status(200).send(answer);
        }
    } catch (e) {
        res.status(500).send('Somenthing went wrong, try again')
    }
});

app.get('/getPoints', async(req, res) => {
    const email = req.body.email;
    //Validacion inicial de datos enviados
    if (!email) {
        res.status(400).send("No email was given");
        return;
    }
    if (!validator.isEmail(email)) {
        res.status(400).send("The email wrongly formated");
        return;
    }
    const username = md5(email);
    try {
        let answer = await connection.getPoints(username);
        if (answer.length == 0) {
            res.status(400).send("No transactions for the given email");
        }
        else {
            res.status(200).send(answer[0]);
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('Somenthing went wrong, try again')
    }
});
app.get('/exportTransactionsToExcel', async(req, res) => {
    const email = req.body.email;
    //Validacion inicial de datos enviados
    if (!email) {
        res.status(400).send("No email was given");
        return;
    }
    if (!validator.isEmail(email)) {
        res.status(400).send("The email wrongly formated");
        return;
    }
    const username = md5(email);
    try {
        let answer = await connection.exportTransactionsToExcel(username);
        if (answer.length == 0) {
            res.status(400).send("No transactions for the given email");
        }
        else {
            const wb = new xl.Workbook();
            const ws = wb.addWorksheet('Sheet 1');    
            const columnNames = [
                "Transaction ID",
                "User ID",
                "Value",
                "Points",
                "Status",
                "Created Date"
            ] 
            let column = 1;
            columnNames.forEach(heading => {
                ws.cell(1, column++)
                    .string(heading)
            });
            //Write Data in Excel file
            let row = 2;
            answer.forEach(transaction => {
                let columnIndex = 1;
                Object.keys(transaction).forEach(columnName => {
                    ws.cell(row, columnIndex++)
                        .string(transaction[columnName] + '')
                });
                row++;
            });
            await wb.write('Transaction.xlsx');

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + 'Transaction.xlsx');
            res.status(200).send('Excel attached to the header');
            
        }
    } catch (e) {
        console.log(e)
        res.status(500).send('Somenthing went wrong, try again')
    }
});