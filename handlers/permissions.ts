import type { RequestHandler, Response } from "express";

import * as configFns from "../helpers/configFns.js";

import * as userFns from "../helpers/userFns.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const forbiddenJSON = (res: Response) => {

  return res
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};


export const adminGetHandler: RequestHandler = (req, res, next) => {

  if (userFns.userIsAdmin(req)) {
    return next();
  }

  return res.redirect(urlPrefix + "/dashboard");
};


export const adminPostHandler: RequestHandler = (req, res, next) => {

  if (userFns.userIsAdmin(req)) {
    return next();
  }

  return res.json(forbiddenJSON);
};


export const updateGetHandler: RequestHandler = (req, res, next) => {

  if (userFns.userCanUpdate(req)) {
    return next();
  }

  return res.redirect(urlPrefix + "/dashboard");
};


export const updatePostHandler: RequestHandler = (req, res, next) => {

  if (userFns.userCanUpdate(req)) {
    return next();
  }

  return res.json(forbiddenJSON);
};


export const createGetHandler: RequestHandler = (req, res, next) => {

  if (userFns.userCanCreate(req)) {
    return next();
  }

  return res.redirect(urlPrefix + "/dashboard");
};


export const createPostHandler: RequestHandler = (req, res, next) => {

  if (userFns.userCanCreate(req)) {
    return next();
  }

  return res.json(forbiddenJSON);
};
