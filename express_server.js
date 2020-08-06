const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const { 
  generateRandomId, 
  getUserByEmail,
  urlsForUserId
} = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['key1']
}));
app.use(methodOverride('_method'));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

const users = {

};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// login users
app.get("/login", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_id]
  }
  res.render('login', templateVars);
});

// register new user page
app.get("/register", (req, res) => {
  let templateVars = { 
    user: users[req.session.user_id]
  }
  res.render('register', templateVars);
});

// add new URL if user is logged in, or redirect to login page
app.get("/urls/new", (req, res) => {
  let templateVars = {  
    user: users[req.session.user_id] 
  };

  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

// main urls page
app.get("/urls", (req, res) => {
  const cookieVal = req.session.user_id;
  if (!cookieVal) {
    req.session = null;
    res.redirect('login');
  } else {
    let templateVars = { 
      urls: urlsForUserId(req.session.user_id, urlDatabase),
      user: users[req.session.user_id]
    }
    res.render("urls_index", templateVars);
  }
});

// URL details page with edit option
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL]["longURL"],
    user: users[req.session.user_id]
  }
  res.render("urls_show", templateVars);
});

// redirect to URL site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  if (longURL !== undefined) {
    res.redirect(302, longURL);
  } else {
    res.redirect(404, "Page not found");
  }
});

// catch-all other urls and redirect to login page
app.get('*', (req, res) => {
  res.redirect('/login');
});

// login by checking if email exists and password matches
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserByEmail(email, users)
  if (getUserByEmail(email, users)) {
    bcrypt
    .compare(password, users[id]["password"])
    .then((result) => {
      if (result) {
        req.session.user_id = id;
        res.redirect('/urls');
      } else {
        return res.status(403).send("Incorrect password")
      }
    })
  } else {
    return res.status(403).send("Cannot find email")
  }
});

// logout and clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  // check for empty input and if user email is already registered
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Invalid email or password");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email already registered, please login");
  } else {
    // if no errors, register user with bcrypt and set cookie
    const userId = generateRandomId(6);
          bcrypt
            .genSalt(10)
            .then((salt) => {
              return bcrypt.hash(password, salt)
            })
            .then((hash) => {
              users[userId] = { 
                id: userId,
                email: email,
                password: hash
              }
            })
            .then(() => {
              req.session.user_id = userId;
              res.redirect('/urls');
              console.log(users);
            })
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomId(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);
});

// DELETE a URL
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]["userID"]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});

// MODIFY a URL
app.put("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]["userID"]) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

