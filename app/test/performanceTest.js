const chai = require('chai');

const { expect } = chai;
const mainApp = require('../main');

// Non-functional requirements testing
describe('Tests for performance',
  function () {
    describe('Account creation will not take longer than 5 seconds', function () {
      it('Creating Basic User Account', function () {
        const username = 'MarkAntony22';
        const password = 'Password';
        const newUser = new mainApp.UserAccount(username, password);
        expect(newUser.createUser())
          .to
          .equal(true);
        mainApp.getProgress(username);
        this.slow(0);
        this.timeout(5000);
        newUser.deleteUser();
      });
      it('Creating Advanced User Account', function () {
        const username = 'aaaaaaaaaaaaaaaaaaaaaaaa';
        const password = 's7d987asdasd88ASA';
        const newUser = new mainApp.UserAccount(username, password);
        expect(newUser.createUser())
          .to
          .equal(true);
        mainApp.getProgress(username);
        this.slow(0);
        this.timeout(5000);
        newUser.deleteUser();
      });
    });
    describe('Account sign in will not take more than 10 seconds', function () {
      it('Signing into a User Account', function () {
        const username = 'MarkAntony22';
        const password = 'Password';
        const newUser = new mainApp.UserAccount(username, password);
        newUser.createUser();
        function combinedTest() {
          if (newUser.userExists()) {
            if (newUser.attemptLogin()) {
              mainApp.getProgress(newUser.username);
            }
          }
          return true;
        }
        expect(combinedTest()).to.equal(true);
        this.slow(0);
        this.timeout(10000);
        newUser.deleteUser();
      });
    });
  });
