const { assert, expect } = require('chai');

const { 
  getUserByEmail, 
  generateRandomId,
  urlsForUserId
} = require('../helpers');

// Constants for Test Code
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "A09cJ4" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "kj4K10": { longURL: "http://www.facebook.com", userID: "A09cJ4" }

};

// TESTS
describe('getUserByEmail', function() {
  it("should return a user with valid email", function() {
    const actual = getUserByEmail("user@example.com", testUsers);
    const expected = "userRandomID";
    assert.strictEqual(actual, expected);
  });

  it("should return undefined if email is not in user database", function() {
    const actual = getUserByEmail("apple@example.com", testUsers);
    const expected = undefined;
    assert.strictEqual(actual, expected);
  });
});

describe('generateRandomId', function() {
  it("should return 6 characters", function() {
    const actual = generateRandomId(6).length;
    const expected = 6;
    assert.strictEqual(actual, expected);
  });
});

describe('urlsForUserId', function() {
  it("should return an object with matching userID urls", function() {
    const actual = urlsForUserId("A09cJ4", testUrlDatabase);
    const expected = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca" },
      "kj4K10": { longURL: "http://www.facebook.com" }
    }
    expect(actual).to.eql(expected);
  });
});