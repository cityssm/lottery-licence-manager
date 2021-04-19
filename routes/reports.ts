import { Router } from "express";

import { handler as handler_reportName } from "../handlers/reports-get/reportName.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";


export const router = Router();


router.get("/", (_req, res) => {

  const rightNow = new Date();

  res.render("report-search", {
    headTitle: "Reports",
    todayDateString: dateTimeFns.dateToString(rightNow)
  });

});


router.all("/:reportName", handler_reportName);
