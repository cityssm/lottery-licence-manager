import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import * as licencesDB from "../../helpers/licencesDB.js";

import type { RequestHandler } from "express";


export const handler: RequestHandler = (_request, response) => {

  // Get event table stats

  const eventTableStats = licencesDB.getEventTableStats();

  // Set application dates

  const eventDate = new Date();

  eventDate.setMonth(eventDate.getMonth() - 1);
  eventDate.setDate(1);

  const eventDateStartString = dateTimeFns.dateToString(eventDate);

  eventDate.setMonth(eventDate.getMonth() + 1);
  eventDate.setDate(0);

  const eventDateEndString = dateTimeFns.dateToString(eventDate);

  response.render("event-financials", {
    headTitle: "Financial Summary",
    pageContainerIsFullWidth: true,
    eventYearMin: (eventTableStats.eventYearMin || new Date().getFullYear() + 1),
    eventDateStartString,
    eventDateEndString
  });
};


export default handler;
