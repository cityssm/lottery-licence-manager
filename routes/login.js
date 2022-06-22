import { Router } from "express";
import Debug from "debug";
import * as configFunctions from "../helpers/functions.config.js";
import * as authenticationFunctions from "../helpers/functions.authentication.js";
import { useTestDatabases } from "../data/databasePaths.js";
const debug = Debug("general-licence-manager:login");
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
            redirect: request.query.redirect,
            useTestDatabases
        });
    }
})
    .post(async (request, response) => {
    const userName = request.body.userName;
    const passwordPlain = request.body.password;
    const redirectURL = getSafeRedirectURL(request.body.redirect);
    let isAuthenticated = false;
    if (userName.charAt(0) === "*") {
        if (useTestDatabases && userName === passwordPlain) {
            isAuthenticated = configFunctions.getProperty("users.testing").includes(userName);
            if (isAuthenticated) {
                debug("Authenticated testing user: " + userName);
            }
        }
    }
    else {
        isAuthenticated = await authenticationFunctions.authenticate(userName, passwordPlain);
    }
    let userObject;
    if (isAuthenticated) {
        const userNameLowerCase = userName.toLowerCase();
        const canLogin = configFunctions.getProperty("users.canLogin")
            .some((currentUserName) => {
            return userNameLowerCase === currentUserName.toLowerCase();
        });
        if (canLogin) {
            const canCreate = configFunctions.getProperty("users.canCreate")
                .some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            const canUpdate = configFunctions.getProperty("users.canUpdate")
                .some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            const isAdmin = configFunctions.getProperty("users.isAdmin")
                .some((currentUserName) => {
                return userNameLowerCase === currentUserName.toLowerCase();
            });
            userObject = {
                userName: userNameLowerCase,
                userProperties: {
                    canCreate,
                    canUpdate,
                    isAdmin
                }
            };
        }
    }
    if (isAuthenticated && userObject) {
        request.session.user = userObject;
        response.redirect(redirectURL);
    }
    else {
        response.render("login", {
            userName,
            message: "Login Failed",
            redirect: redirectURL,
            useTestDatabases
        });
    }
});
export default router;
