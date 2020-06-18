import createError from "http-errors";
import express from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import session from "express-session";
import sqlite3 from "connect-sqlite3";
const SQLiteStore = sqlite3(session);


import * as packageJSON from "./package.json";

import routerDocs from "./routes/docs";
import routerLogin from "./routes/login";
import routerDashboard from "./routes/dashboard";
import routerOrganizations from "./routes/organizations";
import routerLicences from "./routes/licences";
import routerLocations from "./routes/locations";
import routerEvents from "./routes/events";
import routerReports from "./routes/reports";
import routerAdmin from "./routes/admin";

import * as configFns from "./helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns";
import * as htmlFns from "@cityssm/expressjs-server-js/htmlFns";


/*
 * INITALIZE THE DATABASES
 */


import * as dbInit from "./helpers/dbInit";
dbInit.initUsersDB();
dbInit.initLicencesDB();


/*
 * INITIALIZE APP
 */


const app = express();


// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(compression());
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

app.use("/docs/images",
  express.static(path.join(__dirname, "docs", "images")));

app.use("/fa",
  express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));

app.use("/cityssm-bulma-webapp-js",
  express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js")));


/*
 * SESSION MANAGEMENT
 */


const sessionCookieName: string = configFns.getProperty("session.cookieName");


// Initialize session
app.use(session({
  store: new SQLiteStore({
    dir: "data",
    db: "sessions.db"
  }),
  name: sessionCookieName,
  secret: configFns.getProperty("session.secret"),
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: configFns.getProperty("session.maxAgeMillis"),
    sameSite: "strict"
  }
}));

// Clear cookie if no corresponding session
app.use(function(req, res, next) {

  if (req.cookies[sessionCookieName] && !req.session.user) {

    res.clearCookie(sessionCookieName);

  }

  next();

});

// Redirect logged in users
const sessionChecker = function(req: express.Request, res: express.Response, next: express.NextFunction) {

  if (req.session.user && req.cookies[sessionCookieName]) {

    return next();

  }

  return res.redirect("/login?redirect=" + req.originalUrl);

};


/*
 * ROUTES
 */


// Make the user and config objects available to the templates
app.use(function(req, res, next) {

  res.locals.buildNumber = packageJSON.version;
  res.locals.user = req.session.user;
  res.locals.configFns = configFns;
  res.locals.dateTimeFns = dateTimeFns;
  res.locals.stringFns = stringFns;
  res.locals.htmlFns = htmlFns;

  next();

});


app.get("/", sessionChecker, function(_req, res) {

  res.redirect("/dashboard");

});

app.use("/docs", routerDocs);

app.use("/dashboard", sessionChecker, routerDashboard);
app.use("/organizations", sessionChecker, routerOrganizations);
app.use("/licences", sessionChecker, routerLicences);
app.use("/locations", sessionChecker, routerLocations);
app.use("/events", sessionChecker, routerEvents);
app.use("/reports", sessionChecker, routerReports);
app.use("/admin", sessionChecker, routerAdmin);

app.all("/keepAlive", function(_req, res) {
  res.json(true);
});

app.use("/login", routerLogin);

app.get("/logout", function(req, res) {

  if (req.session.user && req.cookies[sessionCookieName]) {

    req.session.destroy(null);
    req.session = null;
    res.clearCookie(sessionCookieName);
    res.redirect("/");

  } else {

    res.redirect("/login");

  }

});


// Catch 404 and forward to error handler
app.use(function(_req, _res, next) {

  next(createError(404));

});

// Error handler
app.use(function(err: any, req: express.Request, res: express.Response, _next: express.NextFunction) {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");

});


export = app;
