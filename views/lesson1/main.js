var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081
const { spawn } = require('child_process');
const { exec } = require('child_process');
var fs = require('fs');
const resolve = require('path').resolve;

var server = app.listen(port)

app.get('/', function (req, res) {
   res.sendFile(__dirname + "/" + "lesson1.html");
});
app.get('/sidebar.css', function(req, res) {
    res.sendFile(resolve("../../CSS/sidebar.css"));
});

app.get('/home.css', function(req, res) {
    res.sendFile(resolve("../../CSS/home.css"));
});

var compileErr = false;
app.post('/submission', urlencodedParser, function (req, res) {
    response = {
       submission:req.body.submission
    };
    // must write synchronously to ensure main.c exists before gcc is called
    fs.appendFileSync('main.c', createCFile(response.submission, 1), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    const gcc = exec('gcc main.c', function (error, stdout, stderr) {
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
        res.sendFile(__dirname + "/" + "result.html");
    } else {
        compileErr = false;
    }
    });
    gcc.on('exit', function (code) {
        fs.unlink('main.c', function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
        var child = spawn('./a.out');
        var numTests = 1;
        child.stdout.on('data', (data) => {
            // If all tests were passed ("0" to stdout)
            if (!compileErr) {
                if (`${data}` == "0") {
                    console.log("All tests passed!");
                    resultPage = new ResultsPage(true, numTests - `${data}`, numTests, "All tests passed!");
                    resultPage.buildPage();
                } else {
                    console.log(`${data}`+" tests failed!");
                    resultPage = new ResultsPage(true, numTests - `${data}`, numTests, "Some tests failed!");
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
            res.sendFile(__dirname + "/" + "result.html");
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
            testName = "lesson1_tests.c";
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
    }

    /*
    buildPage generates the result.html page with the given instance variables.
    */
    buildPage() {
        if (this.compiled == false) {
            var page = "<h1> Scoring </h1><b><p>Compiler failed with the following output:<p id=\"output\">" + this.out + "</p></b>";
            fs.writeFileSync('result.html', page, function (err) {
                if (err) throw err;
                console.log('Created result.html page!');
                this.isDone = true;
            });
        } else {
            var page = "<h1> Scoring </h1><b><p id=\"score\">" + this.points + " / " + this.maxPoints + "</p><p id=\"output\">" + this.out + "</p></b>";
            fs.writeFileSync('result.html', page, function (err) {
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
