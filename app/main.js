const express = require('express');

const app = express();
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = process.env.PORT || 8081;
const { spawn } = require('child_process');
const { exec } = require('child_process');
const { execSync } = require('child_process');
const fs = require('fs');

const lessonTotal = 5;
const lessonTests = [2, 7, 2, 4]; // Array containing test count per lesson

const encryptorPath = 'programs/encryptor/encryptor';
const usersPath = 'users/';

/*
CookieCipher takes the cookie header string and processes it into
a JSON format with some helpful methods.
*/
class CookieCipher {
  constructor(data) {
    if (data !== undefined) {
      const dataSplit = data.split('; ');
      for (const i of dataSplit) {
        const tempSplit = i.split('=');
        const name = tempSplit[0];
        this[name] = '';
        for (const j of tempSplit.slice(1)) {
          this[name] += j;
        }
      }
    }
  }

  /*
    If the user's browser has a cookie for the given element elem, the
    function will return true. Otherwise, function will return false.
    */
  hasElement(elem) {
    if (this[elem] !== undefined) {
      return true;
    }
    return false;
  }
}

/*
The User Account class takes a username and a password as constructors
and can be used to verify that the password is correct for the
corresponding username.
*/
class UserAccount {
  constructor(username, password) {
    // Limit username and password to 35 characters
    if (username.length > 35) {
      this.username = username.substring(0, 35);
    } else {
      this.username = username;
    }
    if (password.length > 35) {
      this.password = password.substring(0, 35);
    } else {
      this.password = password;
    }
    this.key = '1234'; // numerical key used to ensure caps-sensitivity
  }

  /*
    userExists checks to see if there exists a folder in the users directory
    with the name of the user. If the folder exists, userExists() will return
    true, otherwise it will return false.
    */
  userExists() {
    if (fs.existsSync(usersPath + this.username)) {
      return true;
    }
    return false;
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
      fs.writeFileSync(`${usersPath + this.username}/passchk`, this.key + this.password, function (err) {
        if (err) throw err;
        this.isDone = true;
      });
      // Bash commands from node are not logged in .bash_history
      execSync(`${encryptorPath} ${usersPath}${this.username}/passchk ${this.password}`,
        function (error) {
          if (error) {
            console.log(error.stack);
            console.log(`Error code: ${error.code}`);
            console.log(`Signal received: ${error.signal}`);
          }
        });
      const progressSetup = 'Lesson1=0\nLesson2=0\nLesson3=0\nLesson4=0\nLesson5=0';
      fs.writeFileSync(`${usersPath + this.username}/progress`, progressSetup, function (err) {
        if (err) throw err;
      });
      return true;
    }
    return false;
  }

  /*
    attemptLogin will attemp to log into the current account. If attemptLogin
    detects an incorrect password or missing user, attemptLogin will return false.
    If attemptLogin successfully logs in with the correct password, the method
    will return true.
    */
  attemptLogin() {
    const user = this.username;
    const pass = this.password;
    const { key } = this;
    let attempt = false;
    if (fs.existsSync(`${usersPath + this.username}/passchk`)) {
      /*
            Decrypt the passchk file with the given password, and check
            if the contents of the file equal the given password.
            */
      execSync(`${encryptorPath} ${usersPath}${this.username}/passchk ${this.password}`,
        function (error) {
          if (error) {
            console.log(error.stack);
            console.log(`Error code: ${error.code}`);
            console.log(`Signal received: ${error.signal}`);
          }
        });
      const data = fs.readFileSync(`${usersPath + user}/passchk`, { encoding: 'utf8', flag: 'r' });
      if (`${data}` === key + pass) {
        attempt = true;
      } else {
        attempt = false;
      }
      /*
            Re-encrypt the passchk file after decryption using the given
            password.
            */
      execSync(`${encryptorPath} ${usersPath}${this.username}/passchk ${this.password}`,
        function (error) {
          if (error) {
            console.log(error.stack);
            console.log(`Error code: ${error.code}`);
            console.log(`Signal received: ${error.signal}`);
          }
        });
      return attempt;
    }
    return false;
  }

  /*
  deleteUser will delete the current user. The function will return true if the account was successfully deleted,
  and false if the function failed.
   */
  deleteUser() {
    if (this.userExists()) {
      if (fs.existsSync(`${usersPath + this.username}/passchk`)) {
        fs.unlinkSync(`${usersPath + this.username}/passchk`);
      }
      if (fs.existsSync(`${usersPath + this.username}/progress`)) {
        fs.unlinkSync(`${usersPath + this.username}/progress`);
      }
      if (fs.existsSync(`${usersPath + this.username}/program`)) {
        fs.unlinkSync(`${usersPath + this.username}/program`);
      }
      if (fs.existsSync(`${usersPath + this.username}/result.html`)) {
        fs.unlinkSync(`${usersPath + this.username}/result.html`);
      }
      if (fs.existsSync(`${usersPath + this.username}/updatedprogress.html`)) {
        fs.unlinkSync(`${usersPath + this.username}/updatedprogress.html`);
      }
      fs.rmdir(`${usersPath + this.username}`, function (err) {
        if (err) throw err;
      });
      return true;
    }
    return false;
  }
}

// Returns the number corresponding to the current user's furthest lesson
function getProgress(username) {
  const progressdata = fs.readFileSync(`${__dirname}/users/${username}/progress`, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return undefined;
    }
    return data;
  });
  if (progressdata) { // if progressdata has a value assigned to it
    let completed = 0;
    let index = 9;
    let checkOrX = progressdata.substring(index - 1, index);
    // this will continue to loop until it's checked all the lessons a user has completed
    while (checkOrX === '1' && completed < lessonTotal) {
      completed++;
      index += 10;
      checkOrX = progressdata.substring(index - 1, index);
      // process.stdout.write("checkOrX = " + checkOrX);
    }
    return completed + 1;
  }
  return 1;
}

/*
findProgress takes a cookieCipher object and returns the path to the progress
html page from within the user's directory. In the case that progress.html
cannot be found, this function will return undefined.
*/
function findProgress(userCookieObj) {
  // 1 is subtracted from getProgress to get # of lessons completed
  const completed = getProgress(userCookieObj.username) - 1;
  let htmlObject = fs.readFileSync(`${__dirname}/views/progress.html`, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return undefined;
    }
    return data;
  });
  if (htmlObject) {
    let reps = 0;
    while (reps < completed) {
      htmlObject = htmlObject.replace('❌', '✅');
      reps++;
    }
    fs.writeFileSync(`${__dirname}/users/${userCookieObj.username}/updatedprogress.html`, htmlObject,
      function (err) {
        if (err) throw err;
      });
    return `${__dirname}/users/${userCookieObj.username}/updatedprogress.html`;
  }

  return undefined;
}

/*
createCFile will take the submission from the user and the current test number
and return the string containing the new C file with the test data, boilerplate,
and the user submission placed in the correct place. If there is not a test
available for the given testNo, will print an error to console.log.
*/
function createCFile(submission, testNo) {
  let testName;
  switch (testNo) {
    // for the first case
    case 1:
      testName = 'lesson_modules/lesson1_tests.c';
      break;
    case 2:
      testName = 'lesson_modules/lesson2_tests.c';
      break;
    case 3:
      testName = 'lesson_modules/lesson3_tests.c';
      break;
    case 4:
      testName = 'lesson_modules/lesson4_tests.c';
      break;
    default:
      console.log('No test defined for test ', testNo, '!');
      return 'Illegal Input';
  }
  if (submission.includes('include')) {
    return 'Illegal Input';
  }
  const data = fs.readFileSync(testName, { encoding: 'utf8', flag: 'r' });
  const testStrings = data.split('//#B');
  const newCFile = testStrings[0] + submission + testStrings[1];
  return newCFile;
}

/*
failedTests will return an array of the specific tests that have failed in a
test suite. failedTests takes a number a and checks each bit to see which
specific test has failed.
*/
function failedTests(a) {
  const testsFailed = [];
  let mask = 1;
  // Iterate through test result 8 times. Function will only take an 8 bit
  // number and check each bit.
  for (let i = 1; i < 9; i++) {
    // eslint-disable-next-line no-bitwise
    if ((a & mask) > 0) {
      testsFailed.push(i); // Push test i that has failed
    }
    // eslint-disable-next-line no-bitwise
    mask <<= 1; // Perform SLL on mask by 1 and repeat
  }
  return testsFailed;
}

/* updateProgress will update the user's progress file given an integer lesson
and an integer status. The lesson integer corresponds to the lesson being
updated, and the status code corresponds to how that lesson will be updated.
If the status code is 0, the lesson will be marked as incomplete, if the status
code is 1, the lesson will be marked as complete, and if the lesson code is 2
then none of the lessons will be updated for the user. */
function updateProgress(lesson, status, username) {
  let progressdata = fs.readFileSync(`${__dirname}/users/${username}/progress`, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return undefined;
    }
    return data;
  });
  // End function early if progressdata failed to read file
  if (!progressdata) {
    return;
  }
  let progressString = '';
  progressdata = progressdata.split('\n');
  for (let i = 1; i <= lessonTotal; i++) {
    if (i === lesson) {
      switch (status) {
        case 0: // Write a 0
          progressString += `Lesson${i}=0\n`;
          break;
        case 1:
          progressString += `Lesson${i}=1\n`;
          break;
        case 2:
          progressString += `${progressdata[i - 1]}\n`;
          break;
        default:
          console.log('Invalid case number in updateProgress');
          break;
      }
      // If we are on the final item, do not add newline character
    } else if (i === lessonTotal) {
      progressString += progressdata[i - 1];
    } else {
      progressString += `${progressdata[i - 1]}\n`;
    }
  }
  fs.writeFileSync(`${__dirname}/users/${username}/progress`, progressString, function (err) {
    if (err) throw err;
  });
}

/*
getFailedDesc will take an array containing the tests failed, and will return
an HTML string for the results page describing each corresponding test.
This function depends on the user's browser containing the cookie describing
the current test.
*/
function getFailedDesc(testsFailed, currentLesson) {
  let testResults = '';
  // switch statement used for current lesson. For this example, if
  // currentLesson is fixed at 1, case 1 will always be called.
  switch (currentLesson) {
    case 1: // For Lesson 1
      // Iterate through all 8 bits (may not all be used)
      for (let i = 1; i < 9; i++) {
        switch (i) {
          case 1:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ a is not equal to 4</p>';
            } else {
              testResults += '<p>✅ a is equal to 4</p>';
            }
            break;
          case 2:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ a is not a integer</p>';
            } else {
              testResults += '<p>✅ a is an integer</p>';
            }
            break;
          default:
            break;
        }
      }
      break;
    case 2: // For Lesson 2
      // Iterate through all 8 bits (may not all be used)
      for (let i = 1; i < 9; i++) {
        switch (i) {
          case 1:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ a is not an integer</p>';
            } else {
              testResults += '<p>✅ a is an integer</p>';
            }
            break;
          case 2:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ b is not an integer</p>';
            } else {
              testResults += '<p>✅ b is an integer</p>';
            }
            break;
          case 3:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ c is not an character</p>';
            } else {
              testResults += '<p>✅ c is a character</p>';
            }
            break;
          case 4:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ a is not equal to 5</p>';
            } else {
              testResults += '<p>✅ a is equal to 5</p>';
            }
            break;
          case 5:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ b is not equal to 7</p>';
            } else {
              testResults += '<p>✅ b is equal to 7</p>';
            }
            break;
          case 6:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ c is not equal to 12</p>';
            } else {
              testResults += '<p>✅ c is equal to 12</p>';
            }
            break;
          case 7:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ c is not equal to a + b</p>';
            } else {
              testResults += '<p>✅ c is equal to a + b</p>';
            }
            break;
          default:
            break;
        }
      }
      break;
    case 3: // For Lesson 3
      // Iterate through all 8 bits (may not all be used)
      for (let i = 1; i < 9; i++) {
        switch (i) {
          case 1:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ specialNum does not return 42</p>';
            } else {
              testResults += '<p>✅ specialNum returns 42</p>';
            }
            break;
          case 2:
            if (testsFailed.includes(i)) {
              testResults += '<p>❌ specialNum does not return an integer</p>';
            } else {
              testResults += '<p>✅ specialNum returns an integer</p>';
            }
            break;
          default:
            break;
        }
      }
      break;
    case 4: // For Lesson 4
      // Iterate through all 8 bits (may not all be used)
      for (let i = 1; i < 9; i++) {
          switch (i) {
            case 1:
              if (testsFailed.includes(i)) {
                testResults += '<p>❌ myArray is not able to hold 3 integers</p>';
              } else {
                testResults += '<p>✅ myArray is able to hold 3 integers</p>'
              }
              break;
            case 2:
              if (testsFailed.includes(i)) {
                testResults += '<p>❌ myArray[0] is not equal to 5</p>';
              } else {
                testResults += '<p>✅ myArray[0] is equal to 5</p>'
              }
              break;
            case 3:
              if (testsFailed.includes(i)) {
                testResults += '<p>❌ myArray[0] is not equal to 3</p>';
              } else {
                testResults += '<p>✅ myArray[0] is equal to 3</p>'
              }
              break;
            case 4:
              if (testsFailed.includes(i)) {
                testResults += '<p>❌ myArray[0] is not equal to 10</p>';
              } else {
                testResults += '<p>✅ myArray[0] is equal to 10</p>'
              }
              break;
            default:
              break;
        }
      }
    default:
      break;
  }
  return testResults;
}

/*
The ResultsPage class takes whether the test has compiled, the points awarded,
and output from the program. ResultsPage will have the ability to build a new
result.html page with the given information.
*/
class ResultsPage {
  constructor(compiled, points, maxPoints, out, user, currentLesson) {
    this.compiled = compiled;
    this.points = points;
    this.out = out;
    this.isDone = false;
    this.maxPoints = maxPoints;
    this.failedTests = failedTests(points);
    this.user = user;
    this.currentLesson = currentLesson;
  }

  /*
    buildPage generates the result.html page with the given instance variables.
    */
  buildPage() {
    let page;
    if (this.compiled === false) {
      page = '<link rel="stylesheet" type="text/css" href="sidebar.css"><link rel="stylesheet" type="text/css" href'
          + '="home.css"><div class="page"><div class="sidebar"><a href="/">Home</a><div class="divider"></div><a href='
      + '"/Progress">Progress</a><div class="divider"></div><a href="/About">About</a></div><div class="contentHeaderBa'
      + 'nner"><div class="lessonHeaderText"><h>Lesson Results</h></div></div><div class="testDisplay"><h1> Scoring </h'
      + `1><b><p>Compiler failed with the following output:<p id="output">${this.out}</p></b></div><div class="center">`
          + '<form action="/go" method="POST"><button>Back</button></form></div>';
      const path = `users/${this.user}/result.html`;
      fs.writeFileSync(path, page, function (err) {
        if (err) throw err;
        this.isDone = true;
      });
    } else {
      let button = ''; // Button can change depending on score
      // If all of the tests have passed
      if (this.failedTests.length === 0) {
        button = '<div class="center"><form action="/prev" method="POST"><button>Back</button></form></div><div '
        + 'class="center"><form action="/go" method="POST"><button>Next Lesson</button></form></div>';
        // update the user's progress when all tests pass
        updateProgress(this.currentLesson, 1, this.user);
      } else {
        button = '<div class="center"><form action="/go" method="POST"><button>Back</button></form></div>';
        updateProgress(this.currentLesson, 0, this.user);
      }
      page = '<link rel="stylesheet" type="text/css" href="sidebar.css"><link rel="stylesheet" type="text/css"'
      + 'href="home.css"><div class="page"><div class="sidebar"><a href="/">Home</a><div class="divider">'
          + '</div><a href="/Progress">Progress</a><div class="divider"></div><a href="/About">About</a></div>'
          + '<div class="contentHeaderBanner"><div class="lessonHeaderText"><h>Lesson Results</h></div></div>'
          + '<div class="testDisplay"><h1> Scoring </h1><b><p id="score">'
          + `${this.maxPoints - this.failedTests.length} / ${this.maxPoints}</p><p id="output">`
          + `${this.out}</p></b>${getFailedDesc(this.failedTests, this.currentLesson)}</div>${button}`;
      const path = `users/${this.user}/result.html`;
      fs.writeFileSync(path, page, function (err) {
        if (err) throw err;
        this.isDone = true;
      });
    }
  }

  isDone() {
    return this.isDone;
  }
}

app.listen(port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function (req, res) {
  res.sendFile((`${__dirname}/views/home.html`));
});

app.get('/sidebar.css', function (req, res) {
  res.sendFile(`${__dirname}/CSS/sidebar.css`);
});

app.get('/home.css', function (req, res) {
  res.sendFile(`${__dirname}/CSS/home.css`);
});

app.get('/About', function (req, res) {
  res.sendFile(`${__dirname}/views/about.html`);
});

app.get('/Progress', function (req, res) {
  const progresscheck = new CookieCipher(req.headers.cookie);
  if (progresscheck.hasElement('username')) {
    const updatedHTMLPath = findProgress(progresscheck);
    if (updatedHTMLPath !== undefined) {
      res.sendFile(updatedHTMLPath);
    }
  } else {
    res.sendFile(`${__dirname}/views/progress.html`);
  }
});

app.post('/go', function (req, res) {
  const usercheck = new CookieCipher(req.headers.cookie); // Read the user's cookie
  if (!usercheck.hasElement('username')) {
    // user does not have a cookie with their account so they get sent to the login page
    res.sendFile(`${__dirname}/views/login.html`);
  } else {
    const currLesson = getProgress(usercheck.username);
    res.cookie('currentLesson', currLesson);
    if (currLesson > lessonTests.length) {
      res.sendFile(`${__dirname}/views/complete.html`);
    } else {
      res.sendFile(`${__dirname}/views/lesson${currLesson}.html`);
    }
  }
});

app.post('/prev', function (req, res) {
  const usercheck = new CookieCipher(req.headers.cookie); // Read the user's cookie
  if (!usercheck.hasElement('username')) {
    // user does not have a cookie with their account so they get sent to the login page
    res.sendFile(`${__dirname}/views/login.html`);
  } else {
    const currLesson = getProgress(usercheck.username) - 1;
    res.cookie('currentLesson', currLesson);
    res.sendFile(`${__dirname}/views/lesson${currLesson}.html`);
  }
});

app.post('/login', function (req, res) {
  const verifyUser = new UserAccount(req.body.username, req.body.password);
  if (verifyUser.userExists()) {
    if (verifyUser.attemptLogin()) {
      res.cookie('username', verifyUser.username);
      const currLesson = getProgress(verifyUser.username);
      res.cookie('currentLesson', currLesson);
      if (currLesson > lessonTests.length) {
        res.sendFile(`${__dirname}/views/complete.html`);
      } else {
        res.sendFile(`${__dirname}/views/lesson${currLesson}.html`);
      }
    }
  }
});

app.post('/createacc', function (req, res) {
  const newUser = new UserAccount(req.body.newusername, req.body.newpassword);
  if (!newUser.userExists()) {
    newUser.createUser();
    res.cookie('username', newUser.username);
    const currLesson = getProgress(newUser.username);
    // Save the currentLesson number as a cookie for later access
    res.cookie('currentLesson', currLesson);
    if (currLesson > lessonTests.length) {
      res.sendFile(`${__dirname}/views/complete.html`);
    } else {
      res.sendFile(`${__dirname}/views/lesson${currLesson}.html`);
    }
  }
});

app.post('/submission', urlencodedParser, function (req, res) {
  let compileErr = false;
  const cookie = new CookieCipher(req.headers.cookie); // Read the user's cookie
  if (!cookie.hasElement('username')) {
    res.sendFile(`${__dirname}/views/home.html`);
    return;
  }
  const response = {
    submission: req.body.submission,
  };
  // must write synchronously to ensure main.c exists before gcc is called
  fs.appendFileSync(`users/${cookie.username}/main.c`, createCFile(response.submission,
    parseInt(cookie.currentLesson, 10)),
  function (err) {
    if (err) throw err;
  });
  const gcc = exec(`gcc -std=c99 -o users/${cookie.username}/program users/${cookie.username}/main.c`,
    function (error, stdout, stderr) {
      if (error) {
        console.log(error.stack);
        console.log(`Error code: ${error.code}`);
        console.log(`Signal received: ${error.signal}`);
      }
      if (stderr.length > 0) {
        compileErr = true;
        const resultPage = new ResultsPage(false, 0, 0, stderr, cookie.username,
          parseInt(cookie.currentLesson, 10));
        resultPage.buildPage();
        res.sendFile(`${__dirname}/users/${cookie.username}/result.html`);
      } else {
        compileErr = false;
      }
    });
  gcc.on('exit', function () {
    fs.unlink(`users/${cookie.username}/main.c`, function (err) {
      if (err) throw err;
    });
    const child = spawn(`./users/${cookie.username}/program`);
    // Get the number of tests from the lessonTests array
    const numTests = lessonTests[parseInt(cookie.currentLesson, 10) - 1];
    child.stdout.on('data', (data) => {
      // If all tests were passed ("0" to stdout)
      if (!compileErr) {
        if (`${data}` === '0') {
          const resultPage = new ResultsPage(true, `${data}`, numTests, 'All tests passed!',
            cookie.username, parseInt(cookie.currentLesson, 10));
          resultPage.buildPage();
        } else {
          const resultPage = new ResultsPage(true, `${data}`, numTests, 'Some tests failed!',
            cookie.username, parseInt(cookie.currentLesson, 10));
          resultPage.buildPage();
        }
      }
    });
    child.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
    child.on('exit', function () {
      res.sendFile(`${__dirname}/users/${cookie.username}/result.html`);
    });
    // res.sendFile(__dirname + "/" + "result.html");
  });
});

exports.failedTests = failedTests;
exports.getProgress = getProgress;
exports.createCFile = createCFile;
exports.updateProgress = updateProgress;
exports.createCFile = createCFile;
exports.UserAccount = UserAccount;
exports.ResultsPage = ResultsPage;
exports.CookieCipher = CookieCipher;
