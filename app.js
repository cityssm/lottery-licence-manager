import createError from "http-errors";
import express from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import session from "express-session";
import sqlite from "connect-sqlite3";
import { router as routerDocs } from "./routes/docs.js";
import { router as routerLogin } from "./routes/login.js";
import { router as routerDashboard } from "./routes/dashboard.js";
import { router as routerOrganizations } from "./routes/organizations.js";
import { router as routerLicences } from "./routes/licences.js";
import { router as routerLocations } from "./routes/locations.js";
import { router as routerEvents } from "./routes/events.js";
import { router as routerReports } from "./routes/reports.js";
import { router as routerAdmin } from "./routes/admin.js";
import * as configFns from "./helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as htmlFns from "@cityssm/expressjs-server-js/htmlFns.js";
import * as dbInit from "./helpers/dbInit.js";
import debug from "debug";
const debugApp = debug("lottery-licence-manager:app");
dbInit.initUsersDB();
dbInit.initLicencesDB();
const __dirname = ".";
export const app = express();
if (!configFns.getProperty("reverseProxy.disableEtag")) {
    app.set("etag", false);
}
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
if (!configFns.getProperty("reverseProxy.disableCompression")) {
    app.use(compression());
}
app.use((req, _res, next) => {
    debugApp(`${req.method} ${req.url}`);
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
const SQLiteStore = sqlite(session);
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
    return res.redirect(`${urlPrefix}/login?redirect=${req.originalUrl}`);
};
app.use((req, res, next) => {
    res.locals.buildNumber = process.env.npm_package_version;
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
