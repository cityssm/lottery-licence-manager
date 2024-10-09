import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import type { NextFunction, Request, Response } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'
import getLicences from '../../helpers/licencesDB/getLicences.js'
import getOrganization from '../../helpers/licencesDB/getOrganization.js'
import { getOrganizationRemarks } from '../../helpers/licencesDB/getOrganizationRemarks.js'
import { getOrganizationReminders } from '../../helpers/licencesDB/getOrganizationReminders.js'

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

  if (!organization.canUpdate) {
    response.redirect(
      `${urlPrefix}/organizations/${organizationID.toString()}/?error=accessDenied-noUpdate`
    )
    return
  }

  const licences = getLicences({ organizationID }, request.session, {
    includeOrganization: false,
    limit: -1
  }).licences

  const remarks = getOrganizationRemarks(organizationID, request.session)

  const reminders = getOrganizationReminders(organizationID, request.session)

  response.render('organization-edit', {
    headTitle: 'Organization Update',
    isViewOnly: false,
    isCreate: false,
    organization,
    licences,
    remarks,
    reminders,
    currentDateInteger: dateTimeFns.dateToInteger(new Date())
  })
}
