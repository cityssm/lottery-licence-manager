import type { RequestHandler } from "express";


export const handler: RequestHandler = (_req, res) => {

  res.render("organization-cleanup", {
    headTitle: "Organization Cleanup"
  });
};
