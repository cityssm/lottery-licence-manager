import type { RequestHandler } from "express";

import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;
  const reminderIndex = req.body.reminderIndex;

  res.json(getOrganizationReminder(organizationID, reminderIndex, req.session));
};
