import type { RequestHandler } from "express";

import { getOrganizationBankRecords } from "../../helpers/licencesDB/getOrganizationBankRecords";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;
  const bankingYear = req.body.bankingYear;
  const accountNumber = req.body.accountNumber;

  res.json(getOrganizationBankRecords(organizationID, accountNumber, bankingYear));

};
