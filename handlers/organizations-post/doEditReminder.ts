import type { RequestHandler } from "express";

import { updateOrganizationReminder } from "../../helpers/licencesDB/updateOrganizationReminder.js";
import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder.js";


export const handler: RequestHandler = (request, response) => {

  const success = updateOrganizationReminder(request.body, request.session);

  if (success) {

    const reminder =
      getOrganizationReminder(request.body.organizationID, request.body.reminderIndex, request.session);

    return response.json({
      success: true,
      reminder
    });

  } else {
    return response.json({
      success: false
    });
  }
};


export default handler;
