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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/views" + "/" + "home.html");
    const cookie = new CookieCipher(req.headers.cookie); // Read the user's cookie
    if (!cookie.hasElement('username')) {
        console.log("Currently logged in as Guest");
    } else {    
        console.log("Currently logged in as " + cookie['username']);
    }
    /* commented this out because if it is live code then you are never prompted to make an account or login as you have a pregenerated account
    var currentUser = new UserAccount('weetsy', 'Shrek');
    if (currentUser.attemptLogin()) {
        res.cookie('username', currentUser.username);
    } else {
        console.log("Failed to log in. No cookies saved");
    }
    */
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
    var usercheck = new CookieCipher(req.headers.cookie); // Read the user's cookie
    if(!usercheck.hasElement(' username')) { // the jsonification of the cookie caused the username field to have a whitespac at the front
        res.sendFile(__dirname + "/views" + "/" + "login.html"); // user does not have a cookie with their account so they get sent to the login page
    }
    else{
        // need to validate username is a real account but not sure how to do this without cookies being saved properly
        console.log("user has an account so they'd be sent to a tutorial but we haven't attached tutorials to the rest of the website yet");
    }
});

app.post('/login', function(req, res) {
    var verifyUser = new UserAccount(req.body.username, req.body.password);
    if(verifyUser.userExists()) {
        if(verifyUser.attemptLogin()) {
            console.log("succesful login!");
            res.cookie('username', currentUser.username);
            res.sendFile(__dirname + "/views" + "/" + "home.html"); // temp sendFile to show program finishes executing
        }
        else {
            console.log("incorrect username/password");
        }
    }
    else{
        console.log("incorrect username/password");
    }
});

app.post('/createacc', function(req, res) {
    var newUser = new UserAccount(req.body.newusername, req.body.newpassword);
    if(!newUser.userExists()) {
        newUser.createUser();
        res.cookie('username', currentUser.username);
        console.log("new user created, needs to be sent to tutorial from here");
        res.sendFile(__dirname + "/views" + "/" + "home.html"); // temp sendFile to show program finishes executing
    }
    else{
        console.log("username already in use"); // need to hook something up to the frontend to notify of this
    }
});


const encryptorPath = 'programs/encryptor/encryptor';
const usersPath = 'users/';

/*
CookieCipher takes the cookie header string and processes it into
a JSON format with some helpful methods. 
*/
class CookieCipher {
    constructor(data) {
        if (data == undefined) {
            return;
        } else {
            const dataSplit = data.split(';');
            for (const i of dataSplit) {
                const tempSplit = i.split('=');
                const name = tempSplit[0];
                this[name] = "";
                    for (const i of tempSplit.slice(1)) {
                        this[name] += i;
                }
            }
        }
    }
    /*
    If the user's browser has a cookie for the given element elem, the
    function will return true. Otherwise, function will return false.
    */
    hasElement(elem) {
        if (this[elem] != undefined) {
            return true;
        } else {
            return false;
        }
    }
}

/*
The User Account class takes a username and a password as constructors
and can be used to verify that the password is correct for the
corresponding username.
*/

class UserAccount {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.key = "1234"; // numerical key used to ensure caps-sensitivity
    }
    /*
    userExists checks to see if there exists a folder in the users directory
    with the name of the user. If the folder exists, userExists() will return
    true, otherwise it will return false.
    */
    userExists() {
        if (fs.existsSync(usersPath + this.username)) {
            console.log("User " + this.username + " exists!");
            return true;
        } else {
            console.log("User " + this.username + " does not exist!");
            return false;
        }
    }
    /*
    createUser checks if a user directory exists. In the case that the user
    exists, this function will return false. If the user directory does
    not exist, this method will create a new user directory with the given
    username and create a password check file containing the password string
    encrypted with the password.
    */
    createUser() {
        if (!this.userExists()) {
            fs.mkdirSync(usersPath + this.username);
            fs.writeFileSync(usersPath + this.username + '/passchk', this.key + this.password, function (err) {
                if (err) throw err;
                console.log('Created passchk file!');
                this.isDone = true;
            });
            // Bash commands from node are not logged in .bash_history
            const encryptor = exec(encryptorPath + ' ' + usersPath + this.username + '/passchk' + " " + this.password, function (error, stdout, stderr) {
            if (error) {
              console.log(error.stack);
              console.log('Error code: '+error.code);
              console.log('Signal received: '+error.signal);
            }
            console.log('Child Process STDERR: '+stderr);
            if (stderr.length > 0) {
                console.log("Failed to encrypt password file!");
            }
            });
            return true;
        } else {
            return false;
        }
    }
    /*
    attemptLogin will attemp to log into the current account. If attemptLogin
    detects an incorrect password or missing user, attemptLogin will return false.
    If attemptLogin successfully logs in with the correct password, the method
    will return true.
    */
    attemptLogin() {
        var user = this.username;
        var pass = this.password;
        var key = this.key;
        var attempt = false;
        if (fs.existsSync(usersPath + this.username + "/passchk")) {
            /*
            Decrypt the passchk file with the given password, and check
            if the contents of the file equal the given password.
            */
            const decryptor = execSync(encryptorPath + ' ' + usersPath + this.username + '/passchk' + " " + this.password, function (error, stdout, stderr) {
                if (error) {
                  console.log(error.stack);
                  console.log('Error code: '+error.code);
                  console.log('Signal received: '+error.signal);
                }
            });
            var data = fs.readFileSync(usersPath + user + '/passchk', {encoding:'utf8', flag:'r'});
            console.log("pass: " + pass + " data: " + data);
            if (data == key + pass) {
                attempt = true;
            } else {
                attempt = false;
            }
            /*
            Re-encrypt the passchk file after decryption using the given
            password.
            */
            const encryptor = execSync(encryptorPath + ' ' + usersPath + this.username + '/passchk' + " " + this.password, function (error, stdout, stderr) {
                if (error) {
                  console.log(error.stack);
                  console.log('Error code: '+error.code);
                  console.log('Signal received: '+error.signal);
                }
            });
            return attempt;
        } else {
            console.log("User passchk file does not exist!");
            return false;
        }
    }
}
// TESTS
var currentUser = new UserAccount('weetsy', 'Shrek');
currentUser.createUser(); // <- Works!
console.log("attempt login: " + currentUser.attemptLogin());
console.log("attempt login: " + currentUser.attemptLogin());
console.log("attempt login: " + currentUser.attemptLogin());
console.log("attempt login: " + currentUser.attemptLogin());
var invalidUser = new UserAccount('weetsy', 'shrek');
console.log("invalid login: " + invalidUser.attemptLogin());

// CURRENTLY BROKEN. SHOULD NORMALLY SAVE COOKIES LOCALLY
// TO THE BROWSER
app.post('/cookie', urlencodedParser, function (req, res) {
    var currentUser = new UserAccount('weetsy', 'Shrek');
    if (currentUser.attemptLogin()) {
        //res.cookie('username', currentUser.username);
        console.log("LOL");
        return;
    } else {
        console.log("Failed to log in. No cookies saved");
        return;
    }
    res.send("User data saved to cookie");
});

