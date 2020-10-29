var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const { info } = require('console');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081;

var server = app.listen(port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/views" + "/" + "home.html");
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