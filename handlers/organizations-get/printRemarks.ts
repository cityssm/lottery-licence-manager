import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { NextFunction, Request, Response } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'
import getOrganization from '../../helpers/licencesDB/getOrganization.js'
import { getOrganizationRemarks } from '../../helpers/licencesDB/getOrganizationRemarks.js'

const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix')

export default function handler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const organizationID = Number(request.params.organizationID)

  if (Number.isNaN(organizationID)) {
    next()
    return
  }

  const organization = getOrganization(organizationID, request.session)

  if (organization === undefined) {
    response.redirect(`${urlPrefix}/organizations/?error=organizationNotFound`)
    return
  }

  const remarks = getOrganizationRemarks(organizationID, request.session)

  response.render('organization-print-remarks', {
    headTitle: organization.organizationName,
    isViewOnly: true,
    organization,
    remarks,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  })
}
