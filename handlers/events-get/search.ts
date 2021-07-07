import type { RequestHandler } from "express";

import * as licencesDB from "../../helpers/licencesDB.js";


export const handler: RequestHandler = (_request, response) => {

  const eventTableStats = licencesDB.getEventTableStats();

  response.render("event-search", {
    headTitle: "Lottery Events",
    eventTableStats
  });
};


export default handler;
