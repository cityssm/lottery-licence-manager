import type { RequestHandler } from "express";


export const handler: RequestHandler = (_req, res) => {

  res.render("event-outstanding", {
    headTitle: "Outstanding Events"
  });
};
