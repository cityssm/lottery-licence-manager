import type { RequestHandler } from "express";

import * as licencesDB_getOrganizationRemarks from "../../helpers/licencesDB/getOrganizationRemarks";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(licencesDB_getOrganizationRemarks.getOrganizationRemarks(organizationID, req.session));
};
