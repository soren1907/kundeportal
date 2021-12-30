const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");

// API to login
router.post("/api/login", (req, res) => {

    const fetchedEmail = req.body.email.toString();
    const fetchedPassword = req.body.password.toString();

    connectHosted((error, client) => {
        const db = client.db("kundeportal");
        const users = db.collection("users");

        if(!(!!fetchedEmail && !!fetchedPassword)){
            res.status(409).send({msg: "Udfyld alle felter"}); 
        } else {
            users.find().toArray((error, data) => {

                if(error) { 
                    throw new Error(error);
                }
                const userData = data.find(user => user.email === fetchedEmail);
    
                if (!userData){
                    client.close();
                    res.status(401).send({msg : 'Forkert mailadresse eller adgangskode'}); 
                } else if (!userData.confirmed){
                    client.close();
                    res.status(401).send({msg : 'mailadressen er ikke bekræftet'}); 
                }else {
                    bcrypt.compare(fetchedPassword, userData.password, (error, result) => {
                        if(result) {
                            req.session.email = userData.email;
                            res.status(200).send({loginSuccess: true});
                        } else {
                            res.status(401).send({loginSuccess: false, msg : 'Forkert mailadresse eller adgangskode'}); 
                        }
                        client.close();
                    })
                }
            });
        }
    });
}); 


module.exports = {
    router
};