import type { RequestHandler } from "express";


export const handler: RequestHandler = (_req, res) => {
  res.render("location-cleanup", {
    headTitle: "Location Cleanup"
  });
};
