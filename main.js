var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081;

var server = app.listen(port);

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