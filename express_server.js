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
  urlsForUserId,
  timeStamp
} = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['key1']
}));
app.use(methodOverride('_method'));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" , visitCount: 0, timeStamp: null },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID", visitCount: 0, timeStamp: null }
};

const users = {

};

app.get("/", (req, res) => {
  res.redirect("/login");
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
  };
  res.render('login', templateVars);
});

// register new user page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
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
  if (users[req.session.user_id] === undefined) {
    req.session = null;
    res.send("Not logged in, please login/register");
  } else {
    let templateVars = {
      urls: urlsForUserId(req.session.user_id, urlDatabase),
      user: users[req.session.user_id],
    };
    res.render("urls_index", templateVars);
  }
});

// URL details page with edit option
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.send("Not logged in, please login/register");
  } else if (urlDatabase[shortURL] === undefined) {
    res.send("URL entered does not exist");
  } else if (req.session.user_id !== urlDatabase[shortURL]["userID"]) {
    res.send("Cannot access requested page");
  } else {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL]["longURL"],
      user: users[req.session.user_id],
      visitCount: urlDatabase[shortURL]["visitCount"],
      timeStamp: urlDatabase[shortURL]["timeStamp"]
    };
    res.render("urls_show", templateVars);
  }
});

// redirect to URL site
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404).send("Page not found");
  } else {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    urlDatabase[req.params.shortURL]["visitCount"] += 1;
    res.status(302).redirect(longURL);
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
  const id = getUserByEmail(email, users);
  if (req.session.user_id) {
    res.redirect('/urls');
  } else if (getUserByEmail(email, users)) {
    bcrypt
      .compare(password, users[id]["password"])
      .then((result) => {
        if (result) {
          req.session.user_id = id;
          res.redirect('/urls');
        } else {
          return res.status(403).send("Incorrect password");
        }
      });
  } else {
    return res.status(403).send("Cannot find email");
  }
});

// logout and clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Register a new user
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
        return bcrypt.hash(password, salt);
      })
      .then((hash) => {
        users[userId] = {
          id: userId,
          email: email,
          password: hash
        };
      })
      .then(() => {
        req.session.user_id = userId;
        res.redirect('/urls');
      });
  }
});

// generate new short URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const shortURL = generateRandomId(6);
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
      visitCount: 0,
      timeStamp: timeStamp()
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// DELETE a URL
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL]["userID"]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
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

