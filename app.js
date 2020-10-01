"use strict";
const createError = require("http-errors");
const express = require("express");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const logger = require("morgan");
const session = require("express-session");
const sqlite3 = require("connect-sqlite3");
const packageJSON = require("./package.json");
const routerDocs = require("./routes/docs");
const routerLogin = require("./routes/login");
const routerDashboard = require("./routes/dashboard");
const routerOrganizations = require("./routes/organizations");
const routerLicences = require("./routes/licences");
const routerLocations = require("./routes/locations");
const routerEvents = require("./routes/events");
const routerReports = require("./routes/reports");
const routerAdmin = require("./routes/admin");
const configFns = require("./helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const htmlFns = require("@cityssm/expressjs-server-js/htmlFns");
const dbInit = require("./helpers/dbInit");
const SQLiteStore = sqlite3(session);
dbInit.initUsersDB();
dbInit.initLicencesDB();
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs/images", express.static(path.join(__dirname, "docs", "images")));
app.use("/fa", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
app.use("/cityssm-bulma-webapp-js", express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js")));
const sessionCookieName = configFns.getProperty("session.cookieName");
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
app.use((req, res, next) => {
    if (req.cookies[sessionCookieName] && !req.session.user) {
        res.clearCookie(sessionCookieName);
    }
    next();
});
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies[sessionCookieName]) {
        return next();
    }
    return res.redirect("/login?redirect=" + req.originalUrl);
};
app.use((req, res, next) => {
    res.locals.buildNumber = packageJSON.version;
    res.locals.user = req.session.user;
    res.locals.configFns = configFns;
    res.locals.dateTimeFns = dateTimeFns;
    res.locals.stringFns = stringFns;
    res.locals.htmlFns = htmlFns;
    res.locals.csrfToken = req.csrfToken();
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
    }
    else {
        res.redirect("/login");
    }
});
app.use((_req, _res, next) => {
    next(createError(404));
});
app.use((err, req, res, _next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
module.exports = app;
