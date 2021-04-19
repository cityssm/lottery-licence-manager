import type { RequestHandler } from "express";

import { addOrganizationReminder } from "../../helpers/licencesDB/addOrganizationReminder.js";


export const handler: RequestHandler = (req, res) => {

  const reminder = addOrganizationReminder(req.body, req.session);

  if (reminder) {
    return res.json({
      success: true,
      reminder
    });
  } else {
    return res.json({
      success: false
    });
  }
};
