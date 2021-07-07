import type { RequestHandler } from "express";

import { addOrganizationReminder } from "../../helpers/licencesDB/addOrganizationReminder.js";


export const handler: RequestHandler = (request, response) => {

  const reminder = addOrganizationReminder(request.body, request.session);

  return reminder
    ? response.json({
      success: true,
      reminder
    })
    : response.json({
      success: false
    });
};


export default handler;
