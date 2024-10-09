import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { NextFunction, Request, Response } from 'express'

import { getProperty } from '../../helpers/functions.config.js'
import getLicences from '../../helpers/licencesDB/getLicences.js'
import getLocation from '../../helpers/licencesDB/getLocation.js'

const urlPrefix = getProperty('reverseProxy.urlPrefix')

export default function handler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const locationID = Number(request.params.locationID)

  if (Number.isNaN(locationID)) {
    next()
    return
  }

  const location = getLocation(locationID, request.session)

  if (location === undefined) {
    response.redirect(`${urlPrefix}/locations/?error=locationNotFound`)
    return
  }

  if (!location.canUpdate) {
    response.redirect(
      `${urlPrefix}/locations/${locationID.toString()}/?error=accessDenied-noUpdate`
    )
    return
  }

  const licences = getLicences(
    {
      locationID
    },
    request.session,
    {
      includeOrganization: true,
      limit: -1
    }
  ).licences

  response.render('location-edit', {
    headTitle: location.locationDisplayName,
    location,
    licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    isCreate: false
  })
}
