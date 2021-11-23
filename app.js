import createError from "http-errors";
import express from "express";
import compression from "compression";
import path from "path";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import session from "express-session";
import sqlite from "connect-sqlite3";
import routerLogin from "./routes/login.js";
import routerDashboard from "./routes/dashboard.js";
import routerOrganizations from "./routes/organizations.js";
import routerLicences from "./routes/licences.js";
import routerLocations from "./routes/locations.js";
import routerEvents from "./routes/events.js";
import routerReports from "./routes/reports.js";
import routerAdmin from "./routes/admin.js";
import * as configFunctions from "./helpers/functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";
import * as htmlFns from "@cityssm/expressjs-server-js/htmlFns.js";
import { dateDiff } from "@cityssm/date-diff";
import { version } from "./version.js";
import * as databaseInitializer from "./helpers/databaseInitializer.js";
import debug from "debug";
const debugApp = debug("lottery-licence-manager:app");
databaseInitializer.initUsersDB();
databaseInitializer.initLicencesDB();
const __dirname = ".";
export const app = express();
if (!configFunctions.getProperty("reverseProxy.disableEtag")) {
    app.set("etag", false);
}
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
if (!configFunctions.getProperty("reverseProxy.disableCompression")) {
    app.use(compression());
}
app.use((request, _response, next) => {
    debugApp(`${request.method} ${request.url}`);
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
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
if (urlPrefix !== "") {
    debugApp("urlPrefix = " + urlPrefix);
}
app.use(urlPrefix, express.static(path.join("public")));
app.use(urlPrefix + "/lib/fa", express.static(path.join("node_modules", "@fortawesome", "fontawesome-free")));
app.use(urlPrefix + "/lib/cityssm-bulma-webapp-js", express.static(path.join("node_modules", "@cityssm", "bulma-webapp-js")));
app.use(urlPrefix + "/lib/cityssm-bulma-js", express.static(path.join("node_modules", "@cityssm", "bulma-js", "dist")));
app.use(urlPrefix + "/lib/date-diff", express.static(path.join("node_modules", "@cityssm", "date-diff", "es2015")));
const SQLiteStore = sqlite(session);
const sessionCookieName = configFunctions.getProperty("session.cookieName");
app.use(session({
    store: new SQLiteStore({
        dir: "data",
        db: "sessions.db"
    }),
    name: sessionCookieName,
    secret: configFunctions.getProperty("session.secret"),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: configFunctions.getProperty("session.maxAgeMillis"),
        sameSite: "strict"
    }
}));
app.use((request, response, next) => {
    if (request.cookies[sessionCookieName] && !request.session.user) {
        response.clearCookie(sessionCookieName);
    }
    next();
});
const sessionChecker = (request, response, next) => {
    if (request.session.user && request.cookies[sessionCookieName]) {
        return next();
    }
    return response.redirect(`${urlPrefix}/login?redirect=${request.originalUrl}`);
};
stringFns.setPhoneNumberCountryCode(configFunctions.getProperty("defaults.countryCode"));
app.use((request, response, next) => {
    response.locals.buildNumber = version;
    response.locals.user = request.session.user;
    response.locals.csrfToken = request.csrfToken();
    response.locals.configFunctions = configFunctions;
    response.locals.dateTimeFns = dateTimeFns;
    response.locals.dateDiff = dateDiff;
    response.locals.stringFns = stringFns;
    response.locals.htmlFns = htmlFns;
    response.locals.urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
    next();
});
app.get(urlPrefix + "/", sessionChecker, (_request, response) => {
    response.redirect(urlPrefix + "/dashboard");
});
app.use(urlPrefix + "/dashboard", sessionChecker, routerDashboard);
app.use(urlPrefix + "/organizations", sessionChecker, routerOrganizations);
app.use(urlPrefix + "/licences", sessionChecker, routerLicences);
app.use(urlPrefix + "/locations", sessionChecker, routerLocations);
app.use(urlPrefix + "/events", sessionChecker, routerEvents);
app.use(urlPrefix + "/reports", sessionChecker, routerReports);
app.use(urlPrefix + "/admin", sessionChecker, routerAdmin);
app.all(urlPrefix + "/keepAlive", (_request, response) => {
    response.json(true);
});
app.use(urlPrefix + "/login", routerLogin);
app.get(urlPrefix + "/logout", (request, response) => {
    if (request.session.user && request.cookies[sessionCookieName]) {
        request.session.destroy(null);
        request.session = undefined;
        response.clearCookie(sessionCookieName);
        response.redirect(urlPrefix + "/");
    }
    else {
        response.redirect(urlPrefix + "/login");
    }
});
app.use((_request, _response, next) => {
    next(createError(404));
});
app.use((error, request, response) => {
    response.locals.message = error.message;
    response.locals.error = request.app.get("env") === "development" ? error : {};
    response.status(error.status || 500);
    response.render("error");
});
export default app;
