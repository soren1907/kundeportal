const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");

// API to Shows cookies modal
router.get("/api/session", (req,res) => {
    if(req.session.newSession == null) {
        req.session.newSession = false;
        res.send({newSession: true});
    } 
});

// API to Get email from logged in user
router.get("/api/email", (req, res) => {
    res.status(200).send({email: req.session.email});
});

// API to signout
router.post("/api/signout", (req, res) => {
    req.session = null;
    res.status(201).send({msg: "logged out"});
});

// API to delete user profile
router.delete("/api/profile", (req, res) => {
    const fetchedPassword = req.body.password.toString();
    connectHosted((error, client) => {

        const db = client.db("kundeportal");
        const users = db.collection("users");

        users.find().toArray((error, data) => {
            if(error) { 
                throw new Error(error);
            }
            const userData = data.find(user => user.email === req.session.email);
            bcrypt.compare(fetchedPassword, userData.password, (error, result) => {
                if(result) {
                    req.session = null;
                    users.deleteOne({email: userData.email}, (error, result ) => {
                        if (error) {
                            throw new Error(error);
                        }
                        client.close();
                    });
                    res.status(200).send({deleteSuccess: true});
                } else {
                    client.close();
                    res.status(404).send({deleteSuccess: false});
                }
            });
        });
    });
});

module.exports = {
    router
};