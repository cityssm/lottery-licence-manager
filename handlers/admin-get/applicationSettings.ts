import type { RequestHandler } from "express";

import { getApplicationSettings } from "../../helpers/licencesDB/getApplicationSettings.js";


export const handler: RequestHandler = (_req, res) => {

  const applicationSettings = getApplicationSettings();

  res.render("admin-applicationSettings", {
    headTitle: "Application Settings",
    applicationSettings
  });
};
