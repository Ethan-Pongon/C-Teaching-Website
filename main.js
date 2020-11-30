var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const { info } = require('console');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { execSync } = require('child_process')
var fs = require('fs');

// These values should be stored in user cookie / user folder
var currentLesson = 1;
const lessonTests = [2,3]; // Array containing test count per lesson
let userLog = ""; // Store current username globally
var server = app.listen(port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/views" + "/" + "home.html");
    const cookie = new CookieCipher(req.headers.cookie); // Read the user's cookie
    if (!cookie.hasElement('username')) {
        console.log("Currently logged in as Guest");
    } else {
        console.log("Currently logged in as " + cookie['username']);
        userLog = cookie['username'];
    }
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
    if(!usercheck.hasElement('username')) { // the jsonification of the cookie caused the username field to have a whitespac at the front
        res.sendFile(__dirname + "/views" + "/" + "login.html"); // user does not have a cookie with their account so they get sent to the login page
    }
    else{
        // need to validate username is a real account but not sure how to do this without cookies being saved properly
        console.log("user has an account so they'd be sent to a tutorial but we haven't attached tutorials to the rest of the website yet");
        res.sendFile(__dirname + "/views/lesson1.html");
    }
});

app.post('/login', function(req, res) {
    var verifyUser = new UserAccount(req.body.username, req.body.password);
    if(verifyUser.userExists()) {
        if(verifyUser.attemptLogin()) {
            console.log("succesful login!");
            res.cookie('username', verifyUser.username);
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
        res.cookie('username', newUser.username);
        userLog = newUser.username;
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
            const dataSplit = data.split('; ');
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

var compileErr = false;
app.post('/nextlesson', urlencodedParser, function(req, res) {
    currentLesson++;

    res.sendFile(__dirname + "/lesson" + currentLesson + ".html");
});
app.post('/submission', urlencodedParser, function (req, res) {
    const cookie = new CookieCipher(req.headers.cookie); // Read the user's cookie
    if (!cookie.hasElement('username')) {
        res.sendFile(__dirname + "/views/home.html");
        return;
    }
    console.log("CURRENTLY LOGGED IN AS " + cookie['username']);
    response = {
       submission:req.body.submission
    };
    console.log("Response is");
    console.log(response);
    // must write synchronously to ensure main.c exists before gcc is called
    fs.appendFileSync('users/' + cookie['username'] + '/main.c', createCFile(response.submission, currentLesson), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    const gcc = exec('gcc -o users/' + cookie['username'] + '/program users/' + userLog + '/main.c', function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: '+error.code);
      console.log('Signal received: '+error.signal);
    }
    console.log('Child Process STDOUT: '+stdout);
    console.log('Child Process STDERR: '+stderr);
    if (stderr.length > 0) {
        compileErr = true;
        resultPage = new ResultsPage(false, 0, 0, stderr);
        resultPage.buildPage();
        res.sendFile(__dirname + "/users/" + cookie['username'] + "/result.html");
    } else {
        compileErr = false;
    }
    });
    gcc.on('exit', function (code) {
        fs.unlink('users/' + cookie['username'] + '/main.c', function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
        var child = spawn('./users/' + cookie['username'] + '/program');
        // Get the number of tests from the lessonTests array
        var numTests = lessonTests[currentLesson - 1];
        child.stdout.on('data', (data) => {
            // If all tests were passed ("0" to stdout)
            if (!compileErr) {
                if (`${data}` == "0") {
                    console.log("All tests passed!");
                    resultPage = new ResultsPage(true, `${data}`, numTests, "All tests passed!");
                    resultPage.buildPage();
                } else {
                    console.log(`${data}`+" tests failed!");
                    resultPage = new ResultsPage(true, `${data}`, numTests, "Some tests failed!");
                    resultPage.buildPage();
                }

            // create text node in result.html or main.html (maybe this allows hot reloading) for showing output (pure js for this i think)
        }});
        child.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
        });
        child.on('exit', function (code) {
            console.log("executed");
            console.log(response);
            res.sendFile(__dirname + "/users/" + cookie['username'] + "/result.html");
        });
    //res.sendFile(__dirname + "/" + "result.html");
    console.log("done")
    });

});

/*
createCFile will take the submission from the user and the current test number
and return the string containing the new C file with the test data, boilerplate,
and the user submission placed in the correct place. If there is not a test
available for the given testNo, will print an error to console.log.
*/
function createCFile(submission, testNo) {
    var testStrings, newCFile;
    var testName;
    switch (testNo) {
        // for the first case
        case 1:
            testName = "lesson_modules/lesson1_tests.c";
            break;
        default:
            console.log("No test defined for test ", testNo, "!");
            return;
    }
    var data = fs.readFileSync(testName, {encoding:'utf8', flag:'r'});
    testStrings = data.split("//#B");
    console.log(testStrings[0]);
    newCFile = testStrings[0] + submission + testStrings[1];
    return newCFile;
}

/*
The ResultsPage class takes whether the test has compiled, the points awarded,
and output from the program. ResultsPage will have the ability to build a new
result.html page with the given information.
*/
class ResultsPage {
    constructor(compiled, points, maxPoints, out) {
        this.compiled = compiled;
        this.points = points;
        this.out = out;
        this.isDone = false;
        this.maxPoints = maxPoints;
        this.failedTests = failedTests(points);
    }
    /*
    buildPage generates the result.html page with the given instance variables.
    */
    buildPage() {
        if (this.compiled == false) {
            var page = "<link rel=\"stylesheet\" type=\"text/css\" href=\"sidebar.css\"><link rel=\"stylesheet\" type=\"text/css\" href=\"home.css\"><div class=\"page\"><div class=\"sidebar\"><a href=\"/\">Home</a><div class=\"divider\"></div><a href=\"/Problems\">Problems</a><div class=\"divider\"></div><a href=\"/Progress\">Progress</a><div class=\"divider\"></div><a href=\"/About\">About</a></div><div class=\"contentHeaderBanner\"><div class=\"lessonHeaderText\"><h>Lesson Results</h></div></div><div class=\"lessonContent\"><h1> Scoring </h1><b><p>Compiler failed with the following output:<p id=\"output\">" + this.out + "</p></b></div>";
            fs.writeFileSync('users/' + userLog + '/result.html', page, function (err) {
                if (err) throw err;
                console.log('Created result.html page!');
                this.isDone = true;
            });
        } else {
            let button = ""; // Button can change depending on score
            // If all of the tests have passed
            if (this.failedTests.length == 0) {
                button = "</div><div class=\"center\"><form action=\"/nextlesson\" method=\"POST\"><button>Next Lesson</button></form></div>";
            } else {
                button = "</div><div class=\"center\"><form action=\"/go\" method=\"POST\"><button>Back</button></form></div>";
            }
            var page = "<link rel=\"stylesheet\" type=\"text/css\" href=\"sidebar.css\"><link rel=\"stylesheet\" type=\"text/css\" href=\"home.css\"><div class=\"page\"><div class=\"sidebar\"><a href=\"/\">Home</a><div class=\"divider\"></div><a href=\"/Problems\">Problems</a><div class=\"divider\"></div><a href=\"/Progress\">Progress</a><div class=\"divider\"></div><a href=\"/About\">About</a></div><div class=\"contentHeaderBanner\"><div class=\"lessonHeaderText\"><h>Lesson Results</h></div></div><div class=\"lessonContent\"><h1> Scoring </h1><b><p id=\"score\">" + (this.maxPoints - this.failedTests.length) + " / " + this.maxPoints + "</p><p id=\"output\">" + this.out + "</p></b>" + getFailedDesc(this.failedTests) + button;
            fs.writeFileSync('users/' + userLog + '/result.html', page, function (err) {
                if (err) throw err;
                console.log('Created result.html page!');
                this.isDone = true;
            });
        }
    }
    isDone () {
        return this.isDone;
    }
}
/*
failedTests will return an array of the specific tests that have failed in a
test suite. failedTests takes a number a and checks each bit to see which
specific test has failed.
*/
function failedTests(a) {
    var failedTests = [];
    var mask = 1;
    // Iterate through test result 8 times. Function will only take an 8 bit
    // number and check each bit.
    for (let i = 1; i < 9; i++) {
        if ((a & mask) > 0) {
            failedTests.push(i); // Push test i that has failed
        }
        mask = mask << 1; // Perform SLL on mask by 1 and repeat
    }
    return failedTests;
}
/*
getFailedDesc will take an array containing the tests failed, and will return
an HTML string for the results page describing each corresponding test.
This function depends on the user's browser containing the cookie describing
the current test.
*/
function getFailedDesc(testsFailed) {
    var testResults = "";
    // switch statement used for current lesson. For this example, if
    // currentLesson is fixed at 1, case 1 will always be called.
    switch (currentLesson) {
        case 1:
            // Iterate through all 8 bits (may not all be used)
            for (let i = 1; i < 9; i++) {
                switch (i) {
                    case 1:
                        if (testsFailed.includes(i)) {
                            testResults += "<p>❌ a is not equal to 4</p>";
                        } else {
                            testResults += "<p>✅ a is equal to 4</p>";
                        }
                        break;
                    case 2:
                        if (testsFailed.includes(i)) {
                            testResults += "<p>❌ a is not a integer</p>";
                        } else {
                            testResults += "<p>✅ a is an integer</p>";
                        }
                        break;
                    default:
                        break;
                }
            }
            break;
        default:
            break;
    }
    return testResults;
}
