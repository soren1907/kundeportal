// Imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const fs = require("fs");
const session = require("express-session");
require("dotenv").config();

// Routes
const registerRouter = require("./router/register_router.js");
const loginRouter = require("./router/login_router.js");
const userSessionRouter = require("./router/user_session_router.js");

// Middleware
app.use(express.static("public"));
app.use(express.json()); // Kan læse json response fra client
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true}));
app.use(loginRouter.router);
app.use(registerRouter.router);
app.use(userSessionRouter.router);
 
// Going to userprofile when not logged in -> no acess (redirect)
const requireSession = (req, res, next) => {
    if(!req.session.email) {
        return res.status(401).send(header + noSession + footer);
    } else {
        next();
    }
};

// Going to login/register when alerady logged in -> user profile (redirect)
const loginCheck = (req, res, next) => {
    if(req.session.email) {
        return res.status(401).send(userHeader + userFrontpage + footer);
    } else {
        next();
    }
};

// Get footer and header html
const header = fs.readFileSync(__dirname + "/public/headers/header/header.html", "utf-8");
const loginHeader = fs.readFileSync(__dirname + "/public/headers/login_header/login_header.html", "utf-8");
const userHeader = fs.readFileSync(__dirname + "/public/headers/user_header/user_header.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html", "utf-8");

// Html for endpoints
const loginFrontpage = fs.readFileSync(__dirname + "/public/login_frontpage/login_frontpage.html", "utf-8");
const loginNemid = fs.readFileSync(__dirname + "/public/login_nemid/login_nemid.html", "utf-8");
const userFrontpage = fs.readFileSync(__dirname + "/public/user_frontpage/user_frontpage.html", "utf-8");
const userSettings = fs.readFileSync(__dirname + "/public/user_settings/user_settings.html", "utf-8");
const resetPassword = fs.readFileSync(__dirname + "/public/reset_password/reset_password.html", "utf-8");
const register = fs.readFileSync(__dirname + "/public/register/register.html", "utf-8");
const noSession = fs.readFileSync(__dirname + "/public/no_access/no_access.html", "utf-8");

//set up routes
app.get("/", loginCheck, (req,res) => {
    res.send(loginHeader + loginFrontpage + footer);
});

app.get("/nemid", loginCheck, (req,res) => {
    res.send(loginHeader + loginNemid + footer);
});

app.get("/register", loginCheck, (req,res) => {
    res.send(header + register + footer);
});

app.get("/user-profile", requireSession, (req,res) => {
    res.send(userHeader + userFrontpage + footer);
});

app.get("/user-settings", requireSession, (req,res) => {
    res.send(userHeader + userSettings + footer);
});

app.get("/forgot-password", (req,res) => {
    res.send(header + resetPassword + footer);
});

// Server start
server.listen(process.env.PORT || 8080, (err) => {
    if(err) {
        console.log(err);
    }
    console.log("Server running on: ", server.address().port);
});