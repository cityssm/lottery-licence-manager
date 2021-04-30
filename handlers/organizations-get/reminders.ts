import type { RequestHandler } from "express";

import * as dateDiff from "@cityssm/date-diff";

import { getUndismissedOrganizationReminders } from "../../helpers/licencesDB/getUndismissedOrganizationReminders.js";


export const handler: RequestHandler = (req, res) => {

  const reminders = getUndismissedOrganizationReminders(req.session);

  res.render("organization-reminders", {
    headTitle: "Organization Reminders",
    reminders,
    dateDiff: dateDiff.dateDiff
  });
};


export default handler;
