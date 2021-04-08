import { Router } from "express";

import { handler as handler_doChangePassword } from "../handlers/dashboard-post/doChangePassword";
import { handler as handler_doGetDefaultConfigProperties } from "../handlers/dashboard-post/doGetDefaultConfigProperties";

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


router.all("/doGetDefaultConfigProperties", handler_doGetDefaultConfigProperties);


export = router;
