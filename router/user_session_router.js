const router = require("express").Router();
const bcrypt = require("bcrypt");
const {connectHosted, connectLocal} = require("../database/db_connection.js");

// Shows cookies modal
router.get("/api/new_session_check", (req,res) => {
    if(req.session.newSession == null) {
        req.session.newSession = false;
        res.send({newSession: true});
    } 
});

// Get email from logged in user
router.get("/api/get_profile", (req, res) => {
    res.status(200).send({email: req.session.email});
});

router.post("/api/signout", (req, res) => {
    delete req.session.email;
    res.status(201).send({msg: "logged out"});
});

router.delete("/api/delete_profile", (req, res) => {
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
                    users.deleteOne({email: userData.email}, (error, result ) => {
                        if (error) {
                            throw new Error(error);
                        }
                        client.close();
                    });
                    delete req.session.user;
                    res.status(200).send({deleteSuccess: true});
                } else {
                    client.close();
                    res.status(404).send({deleteSuccess: false});
                }
            });
        });
    });
});


/*
router.patch("/api/update_password", (req, res) => {
    const oldPassword = req.body.oldPassword.toString();
    const newPassword = req.body.newPassword.toString();
    connectHosted((error, client) => {
        const db = client.db("jokesDB");
        const users = db.collection("user");
        users.find().toArray((error, data) => {
            if(error) { 
                throw new Error(error);
            }
            const userData = data.find(user => user.username === req.session.user);
            bcrypt.compare(oldPassword, userData.password, (error, result) => {
                if(result) {
                    bcrypt.hash(newPassword, 12, (error, hash) => {
                        users.updateOne({username: userData.username}, {$set: {password: hash} }, (error, result ) => {
                            if (error) {
                                throw new Error(error);
                            }
                            client.close();
                        })
                    });
                    res.status(200).send({updateSuccess: true});
                } else {
                    client.close();
                    res.status(404).send({updateSuccess: false});
                }
            });
        });
    });
});
*/

module.exports = {
    router
};