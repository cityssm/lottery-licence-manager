import type { RequestHandler } from "express";

import { getApplicationSettings } from "../../helpers/licencesDB/getApplicationSettings.js";


export const handler: RequestHandler = (_request, response) => {

  const applicationSettings = getApplicationSettings();

  response.render("admin-applicationSettings", {
    headTitle: "Application Settings",
    applicationSettings
  });
};


export default handler;
