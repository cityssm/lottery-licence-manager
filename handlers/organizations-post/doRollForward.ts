import type { RequestHandler } from "express";

import { rollForwardOrganization } from "../../helpers/licencesDB/rollForwardOrganization";


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.body.organizationID, 10);

  const updateFiscalYear = req.body.updateFiscalYear === "1";
  const updateReminders = req.body.updateReminders === "1";

  const result = rollForwardOrganization(organizationID,
    updateFiscalYear,
    updateReminders,
    req.session);

  return res.json(result);
};
