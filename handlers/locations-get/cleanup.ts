import type { RequestHandler } from "express";


export const handler: RequestHandler = (_request, response) => {
  response.render("location-cleanup", {
    headTitle: "Location Cleanup"
  });
};


export default handler;
