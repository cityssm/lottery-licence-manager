import type { RequestHandler } from "express";

import { deleteOrganizationReminder } from "../../helpers/licencesDB/deleteOrganizationReminder.js";


export const handler: RequestHandler = (request, response) => {

  const success =
    deleteOrganizationReminder(request.body.organizationID, request.body.reminderIndex, request.session);

  return response.json({ success });
};


export default handler;
