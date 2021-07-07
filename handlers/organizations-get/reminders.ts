import type { RequestHandler } from "express";

import { getUndismissedOrganizationReminders } from "../../helpers/licencesDB/getUndismissedOrganizationReminders.js";


export const handler: RequestHandler = (request, response) => {

  const reminders = getUndismissedOrganizationReminders(request.session);

  response.render("organization-reminders", {
    headTitle: "Organization Reminders",
    reminders
  });
};


export default handler;
