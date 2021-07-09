import { Router } from "express";
import * as configFunctions from "../helpers/functions.config.js";
import { getUser } from "../helpers/usersDB/getUser.js";
export const router = Router();
const getSafeRedirectURL = (possibleRedirectURL = "") => {
    const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
    const urlToCheck = (possibleRedirectURL.startsWith(urlPrefix)
        ? possibleRedirectURL.slice(urlPrefix.length)
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
    .get((request, response) => {
    const sessionCookieName = configFunctions.getProperty("session.cookieName");
    if (request.session.user && request.cookies[sessionCookieName]) {
        const redirectURL = getSafeRedirectURL((request.query.redirect || ""));
        response.redirect(redirectURL);
    }
    else {
        response.render("login", {
            userName: "",
            message: "",
            redirect: request.query.redirect
        });
    }
})
    .post(async (request, response) => {
    const userName = request.body.userName;
    const passwordPlain = request.body.password;
    const redirectURL = getSafeRedirectURL(request.body.redirect);
    const userObject = await getUser(userName, passwordPlain);
    if (userObject) {
        request.session.user = userObject;
        response.redirect(redirectURL);
    }
    else {
        response.render("login", {
            userName,
            message: "Login Failed",
            redirect: redirectURL
        });
    }
});
export default router;
