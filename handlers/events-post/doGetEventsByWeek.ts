import type { RequestHandler } from "express";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { getLicenceActivityByDateRange } from "../../helpers/licencesDB/getLicenceActivityByDateRange";


export const handler: RequestHandler = (req, res) => {

  const dateWithinWeek = dateTimeFns.dateStringToDate(req.body.eventDate);

  dateWithinWeek.setDate(dateWithinWeek.getDate() - dateWithinWeek.getDay());

  const startDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);

  dateWithinWeek.setDate(dateWithinWeek.getDate() + 6);

  const endDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);

  const activity = getLicenceActivityByDateRange(startDateInteger, endDateInteger);

  res.json(activity);
};
