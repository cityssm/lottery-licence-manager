import type { RequestHandler } from "express";

import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(getOrganizationReminders(organizationID, req.session));
};
