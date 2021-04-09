import type { RequestHandler } from "express";

import * as licencesDB_getDashboardStats from "../../helpers/licencesDB/getDashboardStats";


export const handler: RequestHandler = (_req, res) => {

  const stats = licencesDB_getDashboardStats.getDashboardStats();

  res.render("dashboard", {
    headTitle: "Dashboard",
    stats
  });
};
