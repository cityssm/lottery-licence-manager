import type { RequestHandler } from "express";

import * as licencesDB_getUndismissedOrganizationReminders from "../../helpers/licencesDB/getUndismissedOrganizationReminders";


export const handler: RequestHandler = (req, res) => {

  const reminders = licencesDB_getUndismissedOrganizationReminders.getUndismissedOrganizationReminders(req.session);

  res.render("organization-reminders", {
    headTitle: "Organization Reminders",
    reminders
  });
};
