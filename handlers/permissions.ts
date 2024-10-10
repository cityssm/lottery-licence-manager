import type { NextFunction, Request, Response } from 'express'

import { getProperty } from '../helpers/functions.config.js'
import * as userFunctions from '../helpers/functions.user.js'

const urlPrefix = getProperty('reverseProxy.urlPrefix')

export function forbiddenJSON(response: Response): Response {
  return response.status(403).json({
    success: false,
    message: 'Forbidden'
  })
}

export function adminGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userFunctions.userIsAdmin(request)) {
    next()
    return
  }

  response.redirect(`${urlPrefix}/dashboard`)
}

export function adminPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userFunctions.userIsAdmin(request)) {
    next()
    return
  }

  response.json(forbiddenJSON)
}

export function updateGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userFunctions.userCanUpdate(request)) {
    next()
    return
  }

  response.redirect(`${urlPrefix}/dashboard`)
}

export function updatePostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userFunctions.userCanUpdate(request)) {
    next()
    return
  }

  response.json(forbiddenJSON)
}

export function createGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userFunctions.userCanCreate(request)) {
    next()
    return
  }

  response.redirect(`${urlPrefix}/dashboard`)
}

export function createPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userFunctions.userCanCreate(request)) {
    next()
    return
  }

  response.json(forbiddenJSON)
}
