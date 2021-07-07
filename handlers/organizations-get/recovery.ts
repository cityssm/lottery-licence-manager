import type { RequestHandler } from "express";

import { getDeletedOrganizations } from "../../helpers/licencesDB/getDeletedOrganizations.js";


export const handler: RequestHandler = (_request, response) => {

  const organizations = getDeletedOrganizations();

  response.render("organization-recovery", {
    headTitle: "Organization Recovery",
    organizations
  });
};


export default handler;
