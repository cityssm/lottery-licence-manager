import type { RequestHandler } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import * as licencesDB from "../../helpers/licencesDB.js";


export const handler: RequestHandler = (_request, response) => {

  // Get licence table stats

  const licenceTableStats = licencesDB.getLicenceTableStats();

  // Set start dates

  const startDate = new Date();

  startDate.setDate(1);

  const startDateStartString = dateTimeFns.dateToString(startDate);

  startDate.setMonth(startDate.getMonth() + 1);
  startDate.setDate(0);

  const startDateEndString = dateTimeFns.dateToString(startDate);

  // Render

  response.render("licence-activeSummary", {
    headTitle: "Active Licence Summary",
    startYearMin: (licenceTableStats.startYearMin || new Date().getFullYear()),
    startDateStartString,
    startDateEndString
  });
};


export default handler;
