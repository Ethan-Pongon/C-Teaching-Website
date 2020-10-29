var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const { info } = require('console');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { execSync } = require('child_process')
var fs = require('fs');

var server = app.listen(port);
app.use(cookieParser());
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/views" + "/" + "home.html");
    if (req.headers.cookie == undefined || !req.headers.cookie.includes("username=")) {
        console.log("Currently logged in as Guest");
    } else {    
        console.log("Currently logged in as " + req.headers.cookie.split(';')[0].split('=')[1]);
    }    
    var currentUser = new UserAccount('weetsy', 'Shrek');
    if (currentUser.attemptLogin()) {
        res.cookie('username', currentUser.username);
    } else {
        console.log("Failed to log in. No cookies saved");
    }
    //res.clearCookie("username");
});

app.get('/sidebar.css', function(req, res) {
    res.sendFile(__dirname + "/CSS" + "/" + "sidebar.css");
});

app.get('/home.css', function(req, res) {
    res.sendFile(__dirname + "/CSS" + "/" + "home.css");
});

app.get('/About', function(req, res) {
    res.sendFile(__dirname + "/views" + "/" + "about.html");
});

app.post('/go', function(req, res) {
    res.sendFile(__dirname + "/views" + "/" + "login.html");
});

app.post('/login', function(req, res) {
    console.log("login");
    console.log(req.body.username);
    console.log(req.body.password);
});

app.post('/createacc', function(req, res) {
    console.log("account creation");
    console.log(req.body.newusername);
    console.log(req.body.newpassword);
});



