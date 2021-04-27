import type { RequestHandler } from "express";

import * as licencesDB from "../../helpers/licencesDB.js";


export const handler: RequestHandler = (_req, res) => {

  const eventTableStats = licencesDB.getEventTableStats();

  res.render("event-search", {
    headTitle: "Lottery Events",
    eventTableStats
  });
};


export default handler;
