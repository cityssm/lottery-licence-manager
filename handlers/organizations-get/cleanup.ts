import type { RequestHandler } from "express";


export const handler: RequestHandler = (_request, response) => {

  response.render("organization-cleanup", {
    headTitle: "Organization Cleanup"
  });
};


export default handler;
