import type { RequestHandler } from "express";

import * as licencesDB_getOrganizationReminders from "../../helpers/licencesDB/getOrganizationReminders";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(licencesDB_getOrganizationReminders.getOrganizationReminders(organizationID, req.session));
};
