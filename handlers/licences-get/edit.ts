import type { NextFunction, Request, Response } from 'express'

import { getProperty } from '../../helpers/functions.config.js'
import getLicence from '../../helpers/licencesDB/getLicence.js'
import getOrganization from '../../helpers/licencesDB/getOrganization.js'

const urlPrefix = getProperty('reverseProxy.urlPrefix')

export default function handler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const licenceID = Number(request.params.licenceID)

  if (Number.isNaN(licenceID)) {
    next()
    return
  }

  const licence = getLicence(licenceID, request.session.user)

  if (licence === undefined) {
    response.redirect(`${urlPrefix}/licences/?error=licenceNotFound`)
    return
  } else if (!licence.canUpdate) {
    response.redirect(
      `${urlPrefix}/licences/${licenceID.toString()}/?error=accessDenied`
    )
    return
  }

  const organization = getOrganization(
    licence.organizationID,
    request.session.user
  )

  const feeCalculation = getProperty('licences.feeCalculationFn')(licence)

  const headTitle = getProperty('licences.externalLicenceNumber.isPreferredID')
    ? `Licence ${licence.externalLicenceNumber}`
    : `Licence #${licenceID.toString()}`

  response.render('licence-edit', {
    headTitle: `${headTitle} Update`,
    isCreate: false,
    licence,
    organization,
    feeCalculation
  })
}
