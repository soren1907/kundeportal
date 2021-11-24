const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");

router.post("/api/login", (req, res) => {

    const fetchedEmail = req.body.email.toString();
    const fetchedPassword = req.body.password.toString();
    console.log(fetchedEmail);
    console.log(fetchedPassword)

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
                res.status(401).send({msg : 'Email not found'}); 
            } else{
                bcrypt.compare(fetchedPassword, userData.password, (error, result) => {
                    if(result) {
                        req.session.email = userData.email;
                        res.status(200).send({loginSuccess: true});
                    } else {
                        res.status(401).send({loginSuccess: false}); 
                    }
                    client.close();
                })
            }
        });
    });
}); 


module.exports = {
    router
};