import type { RequestHandler } from "express";

import * as licencesDB_getDashboardStats from "../../helpers/licencesDB/getDashboardStats.js";


export const handler: RequestHandler = (_req, res) => {

  const stats = licencesDB_getDashboardStats.getDashboardStats();

  res.render("dashboard", {
    headTitle: "Dashboard",
    stats
  });
};


export default handler;
