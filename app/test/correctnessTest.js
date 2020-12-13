const fs = require('fs');
const chai = require('chai');

const { expect } = chai;
const mainApp = require('../main');

describe('Test for correctness', function () {
  describe('UserAccounts testing', function () {
    it('Create user when username available', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const newUser = new mainApp.UserAccount(username, password);
      const status = newUser.createUser();
      let result = false;
      if (fs.existsSync(`users/${username}`)) {
        result = true;
      }
      expect(status && result).to.equal(true);
      newUser.deleteUser();
    });
    it('Do not allow user creation when username taken', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const newUser = new mainApp.UserAccount(username, password);
      // Create the account so that it already exists
      newUser.createUser();
      // Get the status of the second attempt, should be false
      const status = newUser.createUser();
      let result = false;
      if (fs.existsSync(`users/${username}`)) {
        result = true;
      }
      expect((status === false) && (result === true)).to.equal(true);
      newUser.deleteUser();
    });
    it('Log into account with correct password', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const newUser = new mainApp.UserAccount(username, password);
      // Create the user first
      newUser.createUser();
      // Attempt to log into the account with the given password, should be true
      const status = newUser.attemptLogin();
      expect(status).to.equal(true);
      newUser.deleteUser();
    });
    it('Deny account login with wrong password', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const newUser = new mainApp.UserAccount(username, password);
      // Create the user first
      newUser.createUser();
      // Attempt to log into the account with the given password, should be true
      const fakeUser = new mainApp.UserAccount(username, 'wrongPass');
      const status = fakeUser.attemptLogin();
      expect(status).to.equal(false);
      newUser.deleteUser();
    });
  });
  describe('CookieCipher testing', function () {
    it('CookieCipher correctly parses cookie header string', function () {
      const fakeCookieHeader = 'username=hello; currentLesson=22; random=stuffhere';
      const cookie = new mainApp.CookieCipher(fakeCookieHeader);
      expect(cookie.username + cookie.currentLesson + cookie.random)
        .to.equal('hello22stuffhere');
    });
  });
  describe('Progress tracking correctness', function () {
    it('getProgress returns 1 for new accounts', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const newUser = new mainApp.UserAccount(username, password);
      newUser.createUser();
      expect(mainApp.getProgress(newUser.username)).to.equal(1);
      newUser.deleteUser();
    });
    it('updateProgress changes user progress', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const newUser = new mainApp.UserAccount(username, password);
      newUser.createUser();
      mainApp.updateProgress(1, 1, username);
      mainApp.updateProgress(2, 1, username);
      expect(mainApp.getProgress(newUser.username)).to.equal(3);
      newUser.deleteUser();
    });
  });
  describe('createCFile creates proper C file', function () {
    it('createCFile properly generates lesson 3 file', function () {
      const username = 'test_case_unique';
      const password = 'frfrfrfrff';
      const submission = 'int specialNum() {\n'
        + 'return 42;\n'
        + '}';
      const mockCFile = '#include <stdio.h>\n'
        + '\n'
        + '/*\n'
        + 'Testfile will check for the following:\n'
        + '1. specialNum returns the value 42,\n'
        + '2. specialNum returns an integer (or 32 bit datatype)\n'
        + '*/\n'
        + '\n'
        + 'int specialNum() {\n'
        + 'return 42;\n'
        + '}'
        + '\n'
        + '\n'
        + 'int assertEquals(int a, int b) {\n'
        + '\tif (a != b) {\n'
        + '\t\treturn 0;\n'
        + '\t}\n'
        + '\treturn 1;\n'
        + '}\n'
        + '\n'
        + 'int binaryTests(int maxTests) {\n'
        + '\tshort testID = 0;\n'
        + '\tfor (int i = 0; i < maxTests; i++) {\n'
        + '\t\ttestID = testID << 1;\n'
        + '\t\ttestID++;\n'
        + '\t}\n'
        + '\treturn testID;\n'
        + '}\n'
        + '\n'
        + 'int main() {\n'
        + '\tint maxErrors = 2;\n'
        + '\tint errorTests = binaryTests(2);\n'
        + '\terrorTests ^= (assertEquals(sizeof(specialNum()), 4) << 1);\n'
        + '\terrorTests ^= (assertEquals(specialNum(), 42));\n'
        + '\tprintf("%d", errorTests);\n'
        + '\treturn errorTests;\n'
        + '}\n';
      const newUser = new mainApp.UserAccount(username, password);
      newUser.createUser();
      const result = mainApp.createCFile(submission, 3);
      expect(result).to.equal(mockCFile);
      newUser.deleteUser();
    });
  });
  describe('failedTests correctly returns an array for incorrect tests', function () {
    it('failedTests(255) returns [1, 2, 3, 4, 5, 6, 7, 8]', function () {
      expect(mainApp.failedTests(255)).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8]);
    });
    it('failedTests(0) returns []', function () {
      expect(mainApp.failedTests(0)).to.deep.equal([]);
    });
    it('failedTests(42) returns [2, 4, 6]', function () {
      expect(mainApp.failedTests(42)).to.deep.equal([2, 4, 6]);
    });
  });
});
