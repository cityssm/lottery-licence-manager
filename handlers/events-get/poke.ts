import type { NextFunction, Request, Response } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'
import pokeEvent from '../../helpers/licencesDB/pokeEvent.js'

const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix')

export default function handler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const licenceID = Number(request.params.licenceID)
  const eventDate = Number(request.params.eventDate)

  if (Number.isNaN(licenceID) || Number.isNaN(eventDate)) {
    next()
    return
  }

  pokeEvent(licenceID, eventDate, request.session.user)

  response.redirect(
    `${urlPrefix}/events/${licenceID.toString()}/${eventDate.toString()}`
  )
}
