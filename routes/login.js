import { Router } from "express";
import * as configFns from "../helpers/configFns.js";
import getUser from "../helpers/usersDB/getUser.js";
export const router = Router();
const getSafeRedirectURL = (possibleRedirectURL = "") => {
    const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
    const urlToCheck = (possibleRedirectURL.startsWith(urlPrefix)
        ? possibleRedirectURL.substring(urlPrefix.length)
        : possibleRedirectURL).toLowerCase();
    switch (urlToCheck) {
        case "/organizations":
        case "/organizations/new":
        case "/organizations/reminders":
        case "/organizations/cleanup":
        case "/organizations/recovery":
        case "/licences":
        case "/licences/new":
        case "/licences/licenceTypes":
        case "/licences/activeSummary":
        case "/events":
        case "/events/byWeek":
        case "/events/recent":
        case "/events/outstanding":
        case "/events/financials":
        case "/locations":
        case "/locations/new":
        case "/locations/cleanup":
        case "/reports":
        case "/admin/applicationSettings":
        case "/admin/userManagement":
            return urlPrefix + urlToCheck;
    }
    return urlPrefix + "/dashboard";
};
router.route("/")
    .get((req, res) => {
    const sessionCookieName = configFns.getProperty("session.cookieName");
    if (req.session.user && req.cookies[sessionCookieName]) {
        const redirectURL = getSafeRedirectURL((req.query.redirect || ""));
        res.redirect(redirectURL);
    }
    else {
        res.render("login", {
            userName: "",
            message: "",
            redirect: req.query.redirect
        });
    }
})
    .post(async (req, res) => {
    const userName = req.body.userName;
    const passwordPlain = req.body.password;
    const redirectURL = getSafeRedirectURL(req.body.redirect);
    const userObj = await getUser(userName, passwordPlain);
    if (userObj) {
        req.session.user = userObj;
        res.redirect(redirectURL);
    }
    else {
        res.render("login", {
            userName,
            message: "Login Failed",
            redirect: redirectURL
        });
    }
});
export default router;
