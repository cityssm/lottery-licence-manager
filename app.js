/* global require, module, __dirname */


const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");


const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);


const router_login = require("./routes/login");
const router_dashboard = require("./routes/dashboard");
const router_organizations = require("./routes/organizations");
const router_licences = require("./routes/licences");
const router_events = require("./routes/events");
const router_reports = require("./routes/reports");


const app = express();


/*
 * INITALIZE THE DATABASES
 */


const dbInit = require("./helpers/dbInit");
dbInit.initUsersDB();
dbInit.initLicencesDB();


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());


/*
 * STATIC ROUTES
 */


app.use(express.static(path.join(__dirname, "public")));
app.use("/fa", express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free"));


/*
 * SESSION MANAGEMENT
 */


const sessionCookieName = "user_sid";


// initialize session
app.use(session({
  store: new SQLiteStore({
    dir: "data",
    db: "sessions.db"
  }),
  key: sessionCookieName,
  secret: "cityssm/lottery-licence-manager",
  resave: true,
  saveUninitialized: false,
  cookie: {
    expires: 3600000
  }
}));

// clear cookie if no corresponding session
app.use(function(req, res, next) {
  "use strict";
  if (req.cookies[sessionCookieName] && !req.session.user) {
    res.clearCookie(sessionCookieName);
  }
  next();
});

// redirect logged in users
const sessionChecker = function(req, res, next) {
  "use strict";
  if (req.session.user && req.cookies[sessionCookieName]) {
    next();
  } else {
    res.redirect("/login");
  }
};


/*
 * ROUTES
 */


// make the user object available to the templates
app.use(function(req, res, next) {
  "use strict";
  res.locals.user = req.session.user;
  next();
});


app.get("/", sessionChecker, function(req, res) {
  "use strict";
  res.redirect("/dashboard");
});

app.use("/dashboard", sessionChecker, router_dashboard);
app.use("/organizations", sessionChecker, router_organizations);
app.use("/licences", sessionChecker, router_licences);
app.use("/events", sessionChecker, router_events);
app.use("/reports", sessionChecker, router_reports);

app.use("/login", router_login);

app.get("/logout", function(req, res) {
  "use strict";
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie(sessionCookieName);
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  "use strict";
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  "use strict";
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;
