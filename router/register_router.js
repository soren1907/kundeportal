const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
require("dotenv").config();

// Setup of mail details
let transport = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "vfkundeportal@hotmail.com",
        pass: process.env.EMAIL_PASSWORD
    }
});

router.post("/api/register", (req, res) => {
    
    const fetchedEmail = req.body.email.toString();
    const fetchedFirstName = req.body.firstName.toString();
    const fetchedLastName = req.body.lastName.toString();
    const fetchedPassword = req.body.password.toString();
    const fetchedPasswordConfirmation = req.body.passwordConfirmation.toString();

    //Check if all fields er filled, email does not allready exists and if password meets req
    //Add user if true
    if(!(!!fetchedEmail && !!fetchedFirstName && !!fetchedLastName && !!fetchedPassword && !!fetchedPasswordConfirmation)){
        res.status(409).send({msg: "Udfyld alle felter", mailsent: false}); 
    } else if(fetchedPassword.length < 8) {
        res.status(409).send({msg: "Adgangskode er for kort", mailsent: false}); 
    } else if(fetchedPassword != fetchedPasswordConfirmation) {
        res.status(409).send({msg: "Adgangskoder er forskellige", mailsent: false});
    } else {

        connectHosted((error, client) => {
            const db = client.db("kundeportal");
            const users = db.collection("users");
    
            users.find().toArray((error, data) => {
                if(error) { 
                    throw new Error(error);
                }
                const userData = data.find(user => user.email === fetchedEmail);
    
                if (userData){
                    client.close();
                    res.status(409).send({msg: "mailadresse er allerede oprettet", mailsent: false});
                } else {
                    bcrypt.hash(fetchedPassword, 12, (error, hash) => {
                        users.insertOne({ email: fetchedEmail, firstName: fetchedFirstName, lastName: fetchedLastName ,password: hash, confirmed: false} , (error, result) => {
                            if (error) {
                                throw new Error(error);
                            }
                            sendConfirmationMail(fetchedEmail);
                            client.close();
                        });
                    });
                    res.status(201).send({msg: `Du vil modtage en mail med et bekræftelselink på mailadressen: ${fetchedEmail}, som vil gøre profilen gyldig.`, mailsent: true});
                }
            });
        });
    }
});

// Endpoint from mail. token is a jwt that stores mail to be confirmed 
router.get('/confirmation/:token', (req, res) => {

    const user = jwt.verify(req.params.token, process.env.EMAIL_SECRET);

    connectHosted((error, client) => {
        const db = client.db("kundeportal");
        const users = db.collection("users");
        users.updateOne({email: user.email}, {$set: {confirmed: true} }, (error, result ) => {
            if (error) {
                throw new Error(error);
            }
            client.close();
        });
    });
    res.redirect('/');
}); 

function sendConfirmationMail(fetchedEmail){

    jwt.sign(
        {
          email: fetchedEmail
        },
        process.env.EMAIL_SECRET,
        (err, emailToken) => {
            const url = `http://localhost:8080/confirmation/${emailToken}`;

            transport.sendMail({
                from: '"Vf kundeportal" <vfkundeportal@hotmail.com>',
                to: fetchedEmail,
                subject: 'Bekræft mail til vf kundeportal',
                html: `Tryk på linket for at bekræfte mailadressen og log derefter ind: <a href="${url}">klik her</a>`,
          });
        },
    );
}

module.exports = {
    router
};