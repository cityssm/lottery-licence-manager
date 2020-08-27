import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";


export const handler: RequestHandler = (_req, res) => {

  res.render("location-edit", {
    headTitle: "Create a New Location",
    location: {
      locationCity: configFns.getProperty("defaults.city"),
      locationProvince: configFns.getProperty("defaults.province")
    },
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    isCreate: true
  });
};
