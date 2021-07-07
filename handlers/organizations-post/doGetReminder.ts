import type { RequestHandler } from "express";

import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder.js";


export const handler: RequestHandler = (request, response) => {

  const organizationID = request.body.organizationID;
  const reminderIndex = request.body.reminderIndex;

  response.json(getOrganizationReminder(organizationID, reminderIndex, request.session));
};


export default handler;
