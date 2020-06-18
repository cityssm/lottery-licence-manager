"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const connect_sqlite3_1 = __importDefault(require("connect-sqlite3"));
const SQLiteStore = connect_sqlite3_1.default(express_session_1.default);
const packageJSON = __importStar(require("./package.json"));
const docs_1 = __importDefault(require("./routes/docs"));
const login_1 = __importDefault(require("./routes/login"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const organizations_1 = __importDefault(require("./routes/organizations"));
const licences_1 = __importDefault(require("./routes/licences"));
const locations_1 = __importDefault(require("./routes/locations"));
const events_1 = __importDefault(require("./routes/events"));
const reports_1 = __importDefault(require("./routes/reports"));
const admin_1 = __importDefault(require("./routes/admin"));
const configFns = __importStar(require("./helpers/configFns"));
const dateTimeFns = __importStar(require("@cityssm/expressjs-server-js/dateTimeFns"));
const stringFns = __importStar(require("@cityssm/expressjs-server-js/stringFns"));
const htmlFns = __importStar(require("@cityssm/expressjs-server-js/htmlFns"));
const dbInit = __importStar(require("./helpers/dbInit"));
dbInit.initUsersDB();
dbInit.initLicencesDB();
const app = express_1.default();
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(compression_1.default());
app.use(morgan_1.default("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: false
}));
app.use(cookie_parser_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/docs/images", express_1.default.static(path_1.default.join(__dirname, "docs", "images")));
app.use("/fa", express_1.default.static(path_1.default.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));
app.use("/cityssm-bulma-webapp-js", express_1.default.static(path_1.default.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js")));
const sessionCookieName = configFns.getProperty("session.cookieName");
app.use(express_session_1.default({
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
    res.locals.buildNumber = packageJSON.version;
    res.locals.user = req.session.user;
    res.locals.configFns = configFns;
    res.locals.dateTimeFns = dateTimeFns;
    res.locals.stringFns = stringFns;
    res.locals.htmlFns = htmlFns;
    next();
});
app.get("/", sessionChecker, function (_req, res) {
    res.redirect("/dashboard");
});
app.use("/docs", docs_1.default);
app.use("/dashboard", sessionChecker, dashboard_1.default);
app.use("/organizations", sessionChecker, organizations_1.default);
app.use("/licences", sessionChecker, licences_1.default);
app.use("/locations", sessionChecker, locations_1.default);
app.use("/events", sessionChecker, events_1.default);
app.use("/reports", sessionChecker, reports_1.default);
app.use("/admin", sessionChecker, admin_1.default);
app.all("/keepAlive", function (_req, res) {
    res.json(true);
});
app.use("/login", login_1.default);
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
    next(http_errors_1.default(404));
});
app.use(function (err, req, res, _next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});
module.exports = app;
