/*
  sf-todo-js-auth - server.js
  Stein Tronstad
    
*/

/*
  DATA MODEL
*/
const todoRecords = [
  "Buy groceries",
  "Fix broken vase",
  "Book holiday",
  "Visit parents",
  "Showel snow",
  "Call grandmother",
  "Read a book",
  "Watch Game of Thrones",
  "Play game with kids",
  "Take a hike",
];
const noOfItems = 4;

/*
  Passport w/Salesforce Oauth2 Strategy
*/
const passport = require("passport"),
  Strategy = require("passport-salesforce-oauth2").Strategy,
  connectEnsureLogin = require("connect-ensure-login");

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://spt-todo-js-auth.herokuapp.com/oauth/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);

/*
  HTTP SERVER
*/
const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  expressSession = require("express-session");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ entended: true }));
app.use(cookieParser());
app.use(
  expressSession({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Callback
app.get(
  "/oauth/callback",
  passport.authenticate("salesforce", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/todos");
  }
);

// Get and Serve ToDos
app.get("/todos", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  let todoRecordsRnd = [];
  for (let i = 0; i < noOfItems; i++) {
    let rndNo = Math.floor(Math.random() * 10);
    todoRecordsRnd.push(todoRecords[rndNo]);
  }
  res.render("todos", {
    name: req.user.displayName,
    mail: req.user.username,
    todos: todoRecordsRnd,
  });
});

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/login/salesforce", passport.authenticate("salesforce"));

// Serve your app
console.log("Served: http://localhost:" + port);
app.listen(port);


















/*
  Helper functions
*/
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
// Helper functions - end
