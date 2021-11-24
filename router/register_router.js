const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");

router.post("/api/register", (req, res) => {
    
    const fetchedEmail = req.body.Email.toString();
    const fetchedFirstName = req.body.firstName.toString();
    const fetchedLastName = req.body.lastName.toString();
    const fetchedPassword = req.body.password.toString();
    const fetchedPasswordConfirmation = req.body.passwordConfirmation.toString();

    //Check if email does not allready exists and if password meets req
    //Add user if true
    if(fetchedPassword.length < 8) {
        res.status(409).send({msg: "Adgangskode er for kort"});
        console.log("for kort");
    } else if(fetchedPassword != fetchedPasswordConfirmation) {
        res.status(409).send({msg: "Adgangskoder er forskellige"});
        console.log("matcher ikke");
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
                    res.status(409).send({msg: "E-mail er allerede oprettet"});
                } else {
                    bcrypt.hash(fetchedPassword, 12, (error, hash) => {
                        users.insertOne({ email: fetchedEmail, firstName: fetchedFirstName, lastName: fetchedLastName ,password: hash} , (error, result) => {
                            if (error) {
                                throw new Error(error);
                            }
                            client.close();
                        });
                    });
                    res.status(201).send({msg: "Profil er oprettet"});
                }
            });
        });
    }

    
});


module.exports = {
    router
};