import type { RequestHandler } from "express";

import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders.js";


export const handler: RequestHandler = (request, response) => {

  const organizationID = request.body.organizationID;

  response.json(getOrganizationReminders(organizationID, request.session));
};


export default handler;
