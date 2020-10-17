var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081
const { spawn } = require('child_process');
const { exec } = require('child_process');
var fs = require('fs');

//console.log("This is working");
var input = createCFile("This is what I want to show", 1);
//console.log(input);
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
