"use strict";
const createError = require("http-errors");
const express = require("express");
const https = require("https");
const fs = require("fs");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const buildNumber = require("./buildNumber.json");
const routerDocs = require("./routes/docs");
const routerLogin = require("./routes/login");
const routerDashboard = require("./routes/dashboard");
const routerOrganizations = require("./routes/organizations");
const routerLicences = require("./routes/licences");
const routerLocations = require("./routes/locations");
const routerEvents = require("./routes/events");
const routerReports = require("./routes/reports");
const routerAdmin = require("./routes/admin");
const configFns_1 = require("./helpers/configFns");
const dateTimeFns_1 = require("./helpers/dateTimeFns");
const dbInit_1 = require("./helpers/dbInit");
dbInit_1.dbInit.initUsersDB();
dbInit_1.dbInit.initLicencesDB();
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
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs/images", express.static(path.join(__dirname, "docs", "images")));
app.use("/fa", express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
const sessionCookieName = configFns_1.configFns.getProperty("session.cookieName");
app.use(session({
    store: new SQLiteStore({
        dir: "data",
        db: "sessions.db"
    }),
    key: sessionCookieName,
    secret: configFns_1.configFns.getProperty("session.secret"),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: configFns_1.configFns.getProperty("session.maxAgeMillis")
    }
}));
app.use(function (req, res, next) {
    if (req.cookies[sessionCookieName] && !req.session.user) {
        res.clearCookie(sessionCookieName);
    }
    next();
});
const sessionChecker = function (req, res, next) {
    if (req.session.user && req.cookies[sessionCookieName]) {
        return next();
    }
    return res.redirect("/login?redirect=" + req.originalUrl);
};
app.use(function (req, res, next) {
    res.locals.buildNumber = buildNumber;
    res.locals.user = req.session.user;
    res.locals.configFns = configFns_1.configFns;
    res.locals.dateTimeFns = dateTimeFns_1.dateTimeFns;
    next();
});
app.get("/", sessionChecker, function (_req, res) {
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
app.use("/login", routerLogin);
app.get("/logout", function (req, res) {
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
app.use(function (_req, _res, next) {
    next(createError(404));
});
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
const httpPort = configFns_1.configFns.getProperty("application.httpPort");
if (httpPort) {
    app.listen(httpPort, function () {
        console.log("HTTP listening on port " + httpPort);
    });
}
const httpsConfig = configFns_1.configFns.getProperty("application.https");
if (httpsConfig) {
    https.createServer({
        key: fs.readFileSync(httpsConfig.keyPath),
        cert: fs.readFileSync(httpsConfig.certPath),
        passphrase: httpsConfig.passphrase
    }, app)
        .listen(httpsConfig.port);
    console.log("HTTPS listening on port " + httpsConfig.port);
}
module.exports = app;
