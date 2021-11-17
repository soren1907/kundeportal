// Imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const fs = require("fs");
const loginRouter = require("./router/login_router");
const registerRouter = require("./router/register_router");

// Middleware
app.use(express.static("public"));
app.use(express.json()); // Kan læse json response fra client
app.use(loginRouter.router);
app.use(registerRouter.router);

// Get footer and header html
const login_header = fs.readFileSync(__dirname + "/public/login_header/login_header.html", "utf-8");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html", "utf-8");

// Html for endpoints
const login_frontpage = fs.readFileSync(__dirname + "/public/login_frontpage/login_frontpage.html", "utf-8");
const login_nemid = fs.readFileSync(__dirname + "/public/login_nemid/login_nemid.html", "utf-8");

//set up routes
app.get("/", (req,res) => {
    res.send(login_header + login_frontpage + footer);
});

app.get("/nemid", (req,res) => {
    res.send(login_header + login_nemid + footer);
});

// Server start
server.listen(process.env.PORT || 8080, (err) => {
    if(err) {
        console.log(err);
    }
    console.log("Server running on: ", server.address().port);
});