const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
require("dotenv").config();

const resetPassword = fs.readFileSync(__dirname + "/../public/user_pages/user_reset_password/user_reset_password.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/../public/footer/footer.html", "utf-8");
const header = fs.readFileSync(__dirname + "/../public/headers/header/header.html", "utf-8");

// Setup of mail details
let transport = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: "vfkundeportal@hotmail.com",
        pass: process.env.EMAIL_PASSWORD
    }
});

// API to Get email and uuid (API)
router.get("/api/reset-info/:token", (req, res) => {
    const user = jwt.verify(req.params.token, process.env.EMAIL_SECRET); 
    res.status(200).send({email: user.email, uuid: user.uuid});
});

// Endpoint from E-mail link. (To change password)
router.get('/reset-password/:token', (req, res) => {

    try{
        const user = jwt.verify(req.params.token, process.env.EMAIL_SECRET); 

        connectHosted((error, client) => {

            const db = client.db("kundeportal");
            const tokens = db.collection("uuid_tokens");
    
            tokens.find().toArray((error, data) => {
                if(error) { 
                    throw new Error(error);
                }
    
                const token = data.find(token => token.token === user.uuid);
    
                if (!token){
                    client.close();
                    res.redirect("/");
                } else {
                    res.send(header + resetPassword + footer);
                }
            });
        });

    } catch(err) {
        res.redirect("/");
    }
    
}); 

// API to send mail to change password
router.post("/api/reset-password", (req, res) => {
    
    const fetchedEmail = req.body.Email.toString();

    connectHosted((error, client) => {

        const db = client.db("kundeportal");
        const users = db.collection("users");

        users.find().toArray((error, data) => {
            if(error) { 
                throw new Error(error);
            }

            const userData = data.find(user => user.email === fetchedEmail);

            if (!userData){
                client.close();
                res.status(409).send({msg: "Indtastet mailadresse tilhører ikke nogen profil", mailsent: false});
            } else {
                uuidToken = uuidv4();
                addTokenToDB(uuidToken, fetchedEmail);
                sendNewPasswordMail(fetchedEmail, uuidToken);
                client.close();
                res.status(201).send({msg: `Du vil modtage en mail med et link på mailadressen: ${fetchedEmail}, som kan bruges til at ændre adgangskode.`, mailsent: true});
            }
        });
    });
});

// API to store new password in DB
router.patch("/api/save-password", (req, res) => {
    
    const fetchedEmail = req.body.email.toString();
    const fetchedPassword = req.body.password.toString();
    const fetchedPasswordConfirmation = req.body.passwordConfirmation.toString();
    const uuid = req.body.uuid.toString();

    if(fetchedPassword.length < 8) {
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

                if (!userData){
                    client.close();
                    res.status(409).send({msg: "Indtastet E-mail tilhører ikke nogen profil", mailsent: false});
                } else {

                    bcrypt.hash(fetchedPassword, 12, (error, hash) => {
                        users.updateOne({email: userData.email}, {$set: {password: hash} }, (error, result ) => {
                            if (error) {
                                throw new Error(error);
                            }
                            client.close();
                        })
                    });
                    deleteTokenFromDB(uuid)
                    res.status(201).send({msg: `Adgangskoden er nu ændret`, mailsent: true});
                }
            });
        });
    }
});

function sendNewPasswordMail(fetchedEmail, uuidToken){

    jwt.sign(
        {
          email: fetchedEmail,
          uuid: uuidToken
        },
        process.env.EMAIL_SECRET,
        (err, emailToken) => {
            const url = `https://vf-kundeportal.herokuapp.com/reset-password/${emailToken}`;

            transport.sendMail({
                from: '"Vf kundeportal" <vfkundeportal@hotmail.com>',
                to: fetchedEmail,
                subject: 'Ændre Adgangskode til vf kundeportal',
                html: `Tryk på linket for at ændre adgangskode: <a href="${url}">klik her</a>`,
            });
        },
    );
}

// Add uuid to DB (token needs to be in DB to access change Password endpoint). 
function addTokenToDB(uuidToken, fetchedEmail) {

    connectHosted((error, client) => {

        const db = client.db("kundeportal");
        const tokens = db.collection("uuid_tokens");

        tokens.insertOne({ token: uuidToken, email: fetchedEmail}, (error, result) => {
            if (error) {
                throw new Error(error);
            }
            client.close();
        });   
    });
}

// Delete uuid when hitting endpoint (can't revisit site)
function deleteTokenFromDB(uuidToken) {

    connectHosted((error, client) => {

        const db = client.db("kundeportal");
        const tokens = db.collection("uuid_tokens");

        tokens.deleteOne({ token: uuidToken}, (error, result) => {
            if (error) {
                throw new Error(error);
            }
            client.close();
        });   
    });
}

module.exports = {
    router
};