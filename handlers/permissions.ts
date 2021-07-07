import type { RequestHandler, Response } from "express";

import * as configFns from "../helpers/configFns.js";

import * as userFns from "../helpers/userFns.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const forbiddenJSON = (response: Response): Response => {

  return response
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};


export const adminGetHandler: RequestHandler = (request, response, next) => {

  if (userFns.userIsAdmin(request)) {
    return next();
  }

  return response.redirect(urlPrefix + "/dashboard");
};


export const adminPostHandler: RequestHandler = (request, response, next) => {

  if (userFns.userIsAdmin(request)) {
    return next();
  }

  return response.json(forbiddenJSON);
};


export const updateGetHandler: RequestHandler = (request, response, next) => {

  if (userFns.userCanUpdate(request)) {
    return next();
  }

  return response.redirect(urlPrefix + "/dashboard");
};


export const updatePostHandler: RequestHandler = (request, response, next) => {

  if (userFns.userCanUpdate(request)) {
    return next();
  }

  return response.json(forbiddenJSON);
};


export const createGetHandler: RequestHandler = (request, response, next) => {

  if (userFns.userCanCreate(request)) {
    return next();
  }

  return response.redirect(urlPrefix + "/dashboard");
};


export const createPostHandler: RequestHandler = (request, response, next) => {

  if (userFns.userCanCreate(request)) {
    return next();
  }

  return response.json(forbiddenJSON);
};
