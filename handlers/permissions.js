import * as configFunctions from "../helpers/functions.config.js";
import * as userFunctions from "../helpers/functions.user.js";
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
export const forbiddenJSON = (response) => {
    return response
        .status(403)
        .json({
        success: false,
        message: "Forbidden"
    });
};
export const adminGetHandler = (request, response, next) => {
    if (userFunctions.userIsAdmin(request)) {
        return next();
    }
    return response.redirect(urlPrefix + "/dashboard");
};
export const adminPostHandler = (request, response, next) => {
    if (userFunctions.userIsAdmin(request)) {
        return next();
    }
    return response.json(forbiddenJSON);
};
export const updateGetHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request)) {
        return next();
    }
    return response.redirect(urlPrefix + "/dashboard");
};
export const updatePostHandler = (request, response, next) => {
    if (userFunctions.userCanUpdate(request)) {
        return next();
    }
    return response.json(forbiddenJSON);
};
export const createGetHandler = (request, response, next) => {
    if (userFunctions.userCanCreate(request)) {
        return next();
    }
    return response.redirect(urlPrefix + "/dashboard");
};
export const createPostHandler = (request, response, next) => {
    if (userFunctions.userCanCreate(request)) {
        return next();
    }
    return response.json(forbiddenJSON);
};
