import { Router } from "express";

import { handler as handler_doChangePassword } from "../handlers/dashboard-post/doChangePassword";

import * as configFns from "../helpers/configFns";
import * as licencesDB_getDashboardStats from "../helpers/licencesDB/getDashboardStats";


const router = Router();


router.get("/", (_req, res) => {

  const stats = licencesDB_getDashboardStats.getDashboardStats();

  res.render("dashboard", {
    headTitle: "Dashboard",
    stats
  });

});


router.post("/doChangePassword", handler_doChangePassword);


router.all("/doGetDefaultConfigProperties", (_req, res) => {

  res.json({
    city: configFns.getProperty("defaults.city"),
    province: configFns.getProperty("defaults.province"),
    externalLicenceNumber_fieldLabel: configFns.getProperty("licences.externalLicenceNumber.fieldLabel"),
    externalReceiptNumber_fieldLabel: configFns.getProperty("licences.externalReceiptNumber.fieldLabel"),
    reminderCategories: configFns.getProperty("reminderCategories"),
    dismissingStatuses: configFns.getProperty("reminders.dismissingStatuses")
  });

});


export = router;
