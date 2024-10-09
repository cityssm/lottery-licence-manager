import type { NextFunction, Request, Response } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'
import getEvent from '../../helpers/licencesDB/getEvent.js'
import getLicence from '../../helpers/licencesDB/getLicence.js'
import { getOrganization } from '../../helpers/licencesDB/getOrganization.js'

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

  const eventObject = getEvent(licenceID, eventDate, request.session)

  if (eventObject === undefined) {
    response.redirect(`${urlPrefix}/events/?error=eventNotFound`)
    return
  }

  const licence = getLicence(licenceID, request.session)

  if (licence === undefined) {
    response.redirect(`${urlPrefix}/events/?error=licenceNotFound`)
    return
  }

  const organization = getOrganization(licence.organizationID, request.session)

  response.render('event-view', {
    headTitle: 'Event View',
    event: eventObject,
    licence,
    organization
  })
}
