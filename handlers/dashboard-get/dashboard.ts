import type { RequestHandler } from "express";

import { getDashboardStats } from "../../helpers/licencesDB/getDashboardStats.js";
import { getApplicationSetting } from "../../helpers/licencesDB/getApplicationSetting.js";
import { getNextExternalLicenceNumberFromRange } from "../../helpers/licencesDB/getNextExternalLicenceNumberFromRange.js";
import * as configFunctions from "../../helpers/functions.config.js";


export const handler: RequestHandler = (_request, response) => {

  const stats = getDashboardStats();

  let dashboardWarningMessage = "";

  if (configFunctions.getProperty("licences.externalLicenceNumber.newCalculation") === "range") {

    const rangeEnd = Number.parseInt(getApplicationSetting("licences.externalLicenceNumber.range.end") || "0", 10);

    if (rangeEnd !== 0) {
      const nextExternalLicenceNumber = getNextExternalLicenceNumberFromRange();

      if (nextExternalLicenceNumber === -1 || (rangeEnd - nextExternalLicenceNumber <= 50)) {
        dashboardWarningMessage = "There are less than 50 remaining licence numbers left in the current range.";
      }
    }
  }

  response.render("dashboard", {
    headTitle: "Dashboard",
    stats,
    dashboardWarningMessage
  });
};


export default handler;
