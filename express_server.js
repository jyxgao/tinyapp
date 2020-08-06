const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomId = function() {
  const allChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += allChars[Math.floor(Math.random() * allChars.length)]
  }
  return randomString;
};
// takes in an email and database, checks if email exists in "users" DB
const ifEmailExists = function(email, db) {
  for (let account in db) {
      if (db[account]["email"] === email) {
        return true;
    }
  }
};
// takes in an email and database, returns user ID if user email exists in "users" DB
const findId = function(email, db) {
  for (let account in db) {
    if (db[account]["email"] === email){
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
        longURL: urlDB[url]["longURL"]
      }
    }
  }
  return urlsFiltered;
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// login
app.get("/login", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,///////
    user: users[req.cookies["user_id"]]
  }
  res.render('login', templateVars);
});

// login by checking if email exists and password matches
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = findId(email, users)
  if (ifEmailExists(email, users)) {
    if (users[id]["password"] === password) {
      res.cookie('user_id', id);
      res.redirect('/urls');
    } else {
      res.send(403, "Incorrect password")
    }
  } else {
    res.send(403, "Cannot find email")
  }
});

// logout and clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// register new user page
app.get("/register", (req, res) => {
  let templateVars = { 
    user: users[req.cookies["user_id"]]
  }
  res.render('register', templateVars);
});

app.post("/register", (req, res) => {
  // check for empty input and if user email is already registered
  if (!req.body.email || !req.body.password) {
    res.send(400, "Invalid email or password");
  } else if (ifEmailExists(req.body.email, users)) {
    res.send(400, "Email already registered, please login");
  } else {
    // if no errors, register user and set cookie
    const userId = generateRandomId();
    users[userId] = { 
      id: userId,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie("user_id", userId);
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  if (longURL !== undefined) {
    res.redirect(302, longURL);
  } else {
    res.redirect(404, "Page not found");
  }
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('login');
  }
  let templateVars = { 
    urls: urlsForUserId(req.cookies["user_id"], urlDatabase),
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomId();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`);
});

// add new URL if user is logged in, or redirect to login page
app.get("/urls/new", (req, res) => {
  let templateVars = {  
    user: users[req.cookies["user_id"]] 
  };

  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL]["longURL"],
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_show", templateVars);
});

// MODIFY a URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL]["userID"]) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// DELETE a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies["user_id"] === urlDatabase[shortURL]["userID"]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

