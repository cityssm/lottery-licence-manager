import type { RequestHandler } from "express";

import * as configFunctions from "../../helpers/functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";


export const handler: RequestHandler = (_request, response) => {

  response.render("location-edit", {
    headTitle: "Create a New Location",
    location: {
      locationCity: configFunctions.getProperty("defaults.city"),
      locationProvince: configFunctions.getProperty("defaults.province")
    },
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    isCreate: true
  });
};


export default handler;
