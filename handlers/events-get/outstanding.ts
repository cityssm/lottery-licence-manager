import type { RequestHandler } from "express";


export const handler: RequestHandler = (_request, response) => {

  response.render("event-outstanding", {
    headTitle: "Outstanding Events"
  });
};


export default handler;
