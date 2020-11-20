import type { RequestHandler } from "express";

import { getOrganizationRemark } from "../../helpers/licencesDB/getOrganizationRemark";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;
  const remarkIndex = req.body.remarkIndex;

  res.json(getOrganizationRemark(organizationID, remarkIndex, req.session));
};
