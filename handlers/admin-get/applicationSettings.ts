import type { RequestHandler } from "express";

import * as licencesDB_getApplicationSettings from "../../helpers/licencesDB/getApplicationSettings";


export const handler: RequestHandler = (_req, res) => {

  const applicationSettings = licencesDB_getApplicationSettings.getApplicationSettings();

  res.render("admin-applicationSettings", {
    headTitle: "Application Settings",
    applicationSettings
  });
};
