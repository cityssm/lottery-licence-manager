"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostHandler = exports.createGetHandler = exports.updatePostHandler = exports.updateGetHandler = exports.adminPostHandler = exports.adminGetHandler = void 0;
const userFns = require("../helpers/userFns");
const adminGetHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
exports.adminGetHandler = adminGetHandler;
const adminPostHandler = (req, res, next) => {
    if (userFns.userIsAdmin(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
exports.adminPostHandler = adminPostHandler;
const updateGetHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
exports.updateGetHandler = updateGetHandler;
const updatePostHandler = (req, res, next) => {
    if (userFns.userCanUpdate(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
exports.updatePostHandler = updatePostHandler;
const createGetHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.redirect("/dashboard");
};
exports.createGetHandler = createGetHandler;
const createPostHandler = (req, res, next) => {
    if (userFns.userCanCreate(req)) {
        return next();
    }
    return res.json(userFns.forbiddenJSON);
};
exports.createPostHandler = createPostHandler;
