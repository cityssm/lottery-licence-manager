import type { RequestHandler, Response } from "express";

import * as configFunctions from "../helpers/functions.config.js";

import * as userFunctions from "../helpers/functions.user.js";


const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");


export const forbiddenJSON = (response: Response): Response => {

  return response
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};


export const adminGetHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userIsAdmin(request)) {
    return next();
  }

  return response.redirect(urlPrefix + "/dashboard");
};


export const adminPostHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userIsAdmin(request)) {
    return next();
  }

  return response.json(forbiddenJSON);
};


export const updateGetHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanUpdate(request)) {
    return next();
  }

  return response.redirect(urlPrefix + "/dashboard");
};


export const updatePostHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanUpdate(request)) {
    return next();
  }

  return response.json(forbiddenJSON);
};


export const createGetHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanCreate(request)) {
    return next();
  }

  return response.redirect(urlPrefix + "/dashboard");
};


export const createPostHandler: RequestHandler = (request, response, next) => {

  if (userFunctions.userCanCreate(request)) {
    return next();
  }

  return response.json(forbiddenJSON);
};
