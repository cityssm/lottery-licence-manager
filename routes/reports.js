import { Router } from "express";
import handler_reportName from "../handlers/reports-get/reportName.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
export const router = Router();
router.get("/", (_request, response) => {
    const rightNow = new Date();
    response.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", handler_reportName);
export default router;
