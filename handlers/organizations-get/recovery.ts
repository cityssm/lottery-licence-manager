import type { RequestHandler } from "express";

import { getDeletedOrganizations } from "../../helpers/licencesDB/getDeletedOrganizations";


export const handler: RequestHandler = (_req, res) => {

  const organizations = getDeletedOrganizations();

  res.render("organization-recovery", {
    headTitle: "Organization Recovery",
    organizations
  });
};
