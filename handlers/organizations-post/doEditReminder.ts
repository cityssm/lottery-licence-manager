import type { RequestHandler } from "express";

import { updateOrganizationReminder } from "../../helpers/licencesDB/updateOrganizationReminder";
import { getOrganizationReminder } from "../../helpers/licencesDB/getOrganizationReminder";


export const handler: RequestHandler = (req, res) => {

  const success = updateOrganizationReminder(req.body, req.session);

  if (success) {

    const reminder =
      getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);

    return res.json({
      success: true,
      reminder
    });

  } else {
    res.json({ success: false });
  }
};
