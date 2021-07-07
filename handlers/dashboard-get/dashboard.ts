import type { RequestHandler } from "express";

import * as licencesDB_getDashboardStats from "../../helpers/licencesDB/getDashboardStats.js";


export const handler: RequestHandler = (_request, response) => {

  const stats = licencesDB_getDashboardStats.getDashboardStats();

  response.render("dashboard", {
    headTitle: "Dashboard",
    stats
  });
};


export default handler;
