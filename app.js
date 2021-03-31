"use strict";
const createError = require("http-errors");
const express = require("express");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const rateLimit = require("express-rate-limit");
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
const debug_1 = require("debug");
const debugApp = debug_1.debug("lottery-licence-manager:app");
const SQLiteStore = sqlite3(session);
dbInit.initUsersDB();
dbInit.initLicencesDB();
const app = express();
if (!configFns.getProperty("reverseProxy.disableEtag")) {
    app.set("etag", false);
}
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
if (!configFns.getProperty("reverseProxy.disableCompression")) {
    app.use(compression());
}
app.use((req, _res, next) => {
    debugApp(req.method + " " + req.url);
    next();
});
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000
});
app.use(limiter);
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
if (urlPrefix !== "") {
    debugApp("urlPrefix = " + urlPrefix);
}
app.use(urlPrefix, express.static(path.join(__dirname, "public")));
app.use(urlPrefix + "/docs/images", express.static(path.join(__dirname, "docs", "images")));
app.use(urlPrefix + "/fa", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
app.use(urlPrefix + "/cityssm-bulma-webapp-js", express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js")));
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
    return res.redirect(urlPrefix + "/login?redirect=" + req.originalUrl);
};
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
    }
    else {
        res.redirect(urlPrefix + "/login");
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
