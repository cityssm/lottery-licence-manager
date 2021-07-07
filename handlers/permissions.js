import * as configFns from "../helpers/configFns.js";
import * as userFns from "../helpers/userFns.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const forbiddenJSON = (response) => {
    return response
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
export const adminGetHandler = (request, response, next) => {
    if (userFns.userIsAdmin(request)) {
        return next();
    }
    return response.redirect(urlPrefix + "/dashboard");
};
export const adminPostHandler = (request, response, next) => {
    if (userFns.userIsAdmin(request)) {
        return next();
    }
    return response.json(forbiddenJSON);
};
export const updateGetHandler = (request, response, next) => {
    if (userFns.userCanUpdate(request)) {
        return next();
    }
    return response.redirect(urlPrefix + "/dashboard");
};
export const updatePostHandler = (request, response, next) => {
    if (userFns.userCanUpdate(request)) {
        return next();
    }
    return response.json(forbiddenJSON);
};
export const createGetHandler = (request, response, next) => {
    if (userFns.userCanCreate(request)) {
        return next();
    }
    return response.redirect(urlPrefix + "/dashboard");
};
export const createPostHandler = (request, response, next) => {
    if (userFns.userCanCreate(request)) {
        return next();
    }
    return response.json(forbiddenJSON);
};
