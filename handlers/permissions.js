import * as configFns from "../helpers/configFns.js";
import * as userFns from "../helpers/userFns.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const forbiddenJSON = (res) => {
    return res
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
export const adminGetHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.redirect(urlPrefix + "/dashboard");
};
export const adminPostHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.json(forbiddenJSON);
};
export const updateGetHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.redirect(urlPrefix + "/dashboard");
};
export const updatePostHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.json(forbiddenJSON);
};
export const createGetHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.redirect(urlPrefix + "/dashboard");
};
export const createPostHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.json(forbiddenJSON);
};
