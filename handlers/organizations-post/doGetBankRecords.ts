import type { Request, Response } from 'express'

import getOrganizationBankRecords from '../../helpers/licencesDB/getOrganizationBankRecords.js'

interface DoGetBankRecordsRequest {
  organizationID: string
  bankingYear: string
  accountNumber: string
}

export default function handler(
  request: Request<unknown, unknown, DoGetBankRecordsRequest>,
  response: Response
): void {
  const organizationID = request.body.organizationID
  const bankingYear = request.body.bankingYear
  const accountNumber = request.body.accountNumber

  response.json(
    getOrganizationBankRecords(organizationID, accountNumber, bankingYear)
  )
}
