import * as createError from "http-errors";
import * as express from "express";
import * as compression from "compression";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";

import * as session from "express-session";
import * as sqlite3 from "connect-sqlite3";
const SQLiteStore = sqlite3(session);


import * as packageJSON from "./package.json";

import * as routerDocs from "./routes/docs";
import * as routerLogin from "./routes/login";
import * as routerDashboard from "./routes/dashboard";
import * as routerOrganizations from "./routes/organizations";
import * as routerLicences from "./routes/licences";
import * as routerLocations from "./routes/locations";
import * as routerEvents from "./routes/events";
import * as routerReports from "./routes/reports";
import * as routerAdmin from "./routes/admin";

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
app.use((req, res, next) => {

  if (req.cookies[sessionCookieName] && !req.session.user) {
    res.clearCookie(sessionCookieName);
  }

  next();
});

// Redirect logged in users
const sessionChecker = (req: express.Request, res: express.Response, next: express.NextFunction) => {

  if (req.session.user && req.cookies[sessionCookieName]) {
    return next();
  }

  return res.redirect("/login?redirect=" + req.originalUrl);
};


/*
 * ROUTES
 */


// Make the user and config objects available to the templates
app.use((req, res, next) => {

  res.locals.buildNumber = packageJSON.version;
  res.locals.user = req.session.user;
  res.locals.configFns = configFns;
  res.locals.dateTimeFns = dateTimeFns;
  res.locals.stringFns = stringFns;
  res.locals.htmlFns = htmlFns;

  next();
});


app.get("/", sessionChecker, (_req, res) => {
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

app.all("/keepAlive", (_req, res) => {
  res.json(true);
});

app.use("/login", routerLogin);

app.get("/logout", (req, res) => {

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
app.use((_req, _res, next) => {
  next(createError(404));
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});


export = app;
