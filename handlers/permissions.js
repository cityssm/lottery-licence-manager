import { getProperty } from '../helpers/functions.config.js';
import * as userFunctions from '../helpers/functions.user.js';
const urlPrefix = getProperty('reverseProxy.urlPrefix');
export function forbiddenJSON(response) {
    return response.status(403).json({
        success: false,
        message: 'Forbidden'
    });
}
export function adminGetHandler(request, response, next) {
    if (userFunctions.userIsAdmin(request)) {
        next();
        return;
    }
    response.redirect(`${urlPrefix}/dashboard`);
}
export function adminPostHandler(request, response, next) {
    if (userFunctions.userIsAdmin(request)) {
        next();
        return;
    }
    response.json(forbiddenJSON);
}
export function updateGetHandler(request, response, next) {
    if (userFunctions.userCanUpdate(request)) {
        next();
        return;
    }
    response.redirect(`${urlPrefix}/dashboard`);
}
export function updatePostHandler(request, response, next) {
    if (userFunctions.userCanUpdate(request)) {
        next();
        return;
    }
    response.json(forbiddenJSON);
}
export function createGetHandler(request, response, next) {
    if (userFunctions.userCanCreate(request)) {
        next();
        return;
    }
    response.redirect(`${urlPrefix}/dashboard`);
}
export function createPostHandler(request, response, next) {
    if (userFunctions.userCanCreate(request)) {
        next();
        return;
    }
    response.json(forbiddenJSON);
}
