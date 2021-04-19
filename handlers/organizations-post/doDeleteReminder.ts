import type { RequestHandler } from "express";

import { deleteOrganizationReminder } from "../../helpers/licencesDB/deleteOrganizationReminder.js";


export const handler: RequestHandler = (req, res) => {

  const success =
    deleteOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);

  return res.json({ success });
};
