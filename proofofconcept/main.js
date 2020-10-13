var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const port=process.env.PORT || 8081

const { spawn } = require('child_process');
const { exec } = require('child_process');
var fs = require('fs');

var server = app.listen(port)

app.get('/', function (req, res) {
   res.sendFile(__dirname + "/" + "main.html")
})

/*app.get('/scripts.js', function(req, res) {
    res.sendFile(__dirname + "/" + "scripts.js")
}); */

app.post('/process_form', urlencodedParser, function (req, res) {
    response = {
       submission:req.body.submission
    };
    // must write synchronously to ensure main.c exists before gcc is called
    fs.appendFileSync('main.c', response.submission, function (err) {
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
    });

    gcc.on('exit', function (code) {
        fs.unlink('main.c', function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
        var child = spawn('./a.out');
        child.stdout.on('data', (data) => {
            /*fs.writeFileSync('output.txt', data, function (err) {
                if (err) throw err;
                console.log("output saved");
            });*/
            console.log(`${data}`);
            // create text node in result.html or main.html (maybe this allows hot reloading) for showing output (pure js for this i think)
        });
        child.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
        });
        child.on('exit', function (code) {
        console.log("executed");
    });
    console.log("done")
    });

    console.log(response);
    res.sendFile(__dirname + "/" + "result.html")
 })