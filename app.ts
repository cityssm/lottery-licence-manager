import * as createError from "http-errors";
import * as express from "express";

import * as compression from "compression";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as csurf from "csurf";
import * as logger from "morgan";
import * as rateLimit from "express-rate-limit";

import * as session from "express-session";
import * as sqlite3 from "connect-sqlite3";

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

import * as dbInit from "./helpers/dbInit";


const SQLiteStore = sqlite3(session);


/*
 * INITALIZE THE DATABASES
 */


dbInit.initUsersDB();
dbInit.initLicencesDB();


/*
 * INITIALIZE APP
 */


const app = express();

if (!configFns.getProperty("reverseProxy.disableEtag")) {
  app.set("etag", false);
}

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

if (!configFns.getProperty("reverseProxy.disableCompression")) {
  app.use(compression());
}

app.use(logger("dev"));
app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(csurf({ cookie: true }));


/*
 * Rate Limiter
 */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500
});

app.use(limiter);


/*
 * STATIC ROUTES
 */


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


app.use(urlPrefix, express.static(path.join(__dirname, "public")));

app.use(urlPrefix + "/docs/images",
  express.static(path.join(__dirname, "docs", "images")));

app.use(urlPrefix + "/fa",
  express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));

app.use(urlPrefix + "/cityssm-bulma-webapp-js",
  // express.static(path.join("..", "bulma-webapp-js"))); // DEBUG
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

  return res.redirect(urlPrefix + "/login?redirect=" + req.originalUrl);
};


/*
 * ROUTES
 */


// Make the user and config objects available to the templates
app.use((req, res, next) => {

  res.locals.buildNumber = packageJSON.version;

  res.locals.user = req.session.user;
  res.locals.csrfToken = req.csrfToken();

  res.locals.configFns = configFns;
  res.locals.dateTimeFns = dateTimeFns;
  res.locals.stringFns = stringFns;
  res.locals.htmlFns = htmlFns;

  res.locals.urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  next();
});


app.get(urlPrefix + "/", sessionChecker, (_req, res) => {
  res.redirect(urlPrefix + "/dashboard");
});

app.use(urlPrefix + "/docs", routerDocs);

app.use(urlPrefix + "/dashboard", sessionChecker, routerDashboard);
app.use(urlPrefix + "/organizations", sessionChecker, routerOrganizations);
app.use(urlPrefix + "/licences", sessionChecker, routerLicences);
app.use(urlPrefix + "/locations", sessionChecker, routerLocations);
app.use(urlPrefix + "/events", sessionChecker, routerEvents);
app.use(urlPrefix + "/reports", sessionChecker, routerReports);
app.use(urlPrefix + "/admin", sessionChecker, routerAdmin);

app.all(urlPrefix + "/keepAlive", (_req, res) => {
  res.json(true);
});

app.use(urlPrefix + "/login", routerLogin);

app.get(urlPrefix + "/logout", (req, res) => {

  if (req.session.user && req.cookies[sessionCookieName]) {

    req.session.destroy(null);
    req.session = null;
    res.clearCookie(sessionCookieName);
    res.redirect(urlPrefix + "/");

  } else {

    res.redirect(urlPrefix + "/login");
  }
});


// Catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

// Error handler
app.use((err: { status: number; message: string },
  req: express.Request, res: express.Response, _next: express.NextFunction) => {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});


export = app;
