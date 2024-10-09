import type { RequestHandler } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'
import { getEvent } from '../../helpers/licencesDB/getEvent.js'
import getLicence from '../../helpers/licencesDB/getLicence.js'
import { getOrganization } from '../../helpers/licencesDB/getOrganization.js'

const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix')

export const handler: RequestHandler = (request, response, next) => {
  const licenceID = Number(request.params.licenceID)
  const eventDate = Number(request.params.eventDate)

  if (Number.isNaN(licenceID) || Number.isNaN(eventDate)) {
    next()
    return
  }

  if (!request.session.user.userProperties.canUpdate) {
    response.redirect(
      `${urlPrefix}/events/${licenceID.toString()}/${eventDate.toString()}/?error=accessDenied`
    )
    return
  }

  const eventObject = getEvent(licenceID, eventDate, request.session)

  if (eventObject === undefined) {
    response.redirect(`${urlPrefix}/events/?error=eventNotFound`)
    return
  }

  if (!eventObject.canUpdate) {
    response.redirect(
      `${urlPrefix}/events/${licenceID.toString()}/${eventDate.toString()}/?error=accessDenied`
    )
    return
  }

  const licence = getLicence(licenceID, request.session)
  const organization = getOrganization(licence.organizationID, request.session)

  response.render('event-edit', {
    headTitle: 'Event Update',
    event: eventObject,
    licence,
    organization
  })
}

export default handler
