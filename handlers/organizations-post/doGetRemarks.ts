import type { RequestHandler } from "express";

import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;

  res.json(getOrganizationRemarks(organizationID, req.session));
};
