// takes in number of char desired, generates a random string alpha-numerically
const generateRandomId = function(numOfChars) {
  const allChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = "";
  for (let i = 0; i < numOfChars; i++) {
    randomString += allChars[Math.floor(Math.random() * allChars.length)];
  }
  return randomString;
};

// takes in an email and database, returns user ID if user email exists in "users" DB
const getUserByEmail = function(email, db) {
  for (let account in db) {
    if (db[account]["email"] === email) {
      return account;
    }
  }
};
// filters a urlDatabase for those that have a matching userID to user logged in
const urlsForUserId = function(userId, urlDB) {
  let urlsFiltered = {};
  for (const url in urlDB) {
    if (urlDB[url]["userID"] === userId) {
      urlsFiltered[url] = {
        longURL: urlDB[url]["longURL"],
        visitCount: urlDB[url]["visitCount"],
        timeStamp: urlDB[url]["timeStamp"]
      };
    }
  }
  return urlsFiltered;
};

// create date of entry
const timeStamp = function() {
  let currentTime = new Date().toDateString();
  return currentTime;
};

console.log(timeStamp());

module.exports = {
  generateRandomId,
  getUserByEmail,
  urlsForUserId,
  timeStamp
};