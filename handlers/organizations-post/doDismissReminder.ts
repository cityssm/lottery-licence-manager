import type { RequestHandler } from "express";

import { dismissOrganizationReminder } from "../../helpers/licencesDB/dismissOrganizationReminder";
import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;
  const reminderIndex = req.body.reminderIndex;

  const success = dismissOrganizationReminder(organizationID, reminderIndex, req.session);

  if (success) {

    const reminder =
      getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);

    res.json({
      success: true,
      message: "Reminder dismissed.",
      reminder
    });

  } else {

    res.json({
      success: false,
      message: "Reminder could not be dismissed."
    });
  }
};
