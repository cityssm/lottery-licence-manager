import type { RequestHandler } from "express";

import * as licencesDBOrganizations from "../../helpers/licencesDB-organizations";


export const handler: RequestHandler = (req, res) => {

  const remarkIndex = licencesDBOrganizations.addOrganizationRemark(req.body, req.session);

  return res.json({
    success: true,
    message: "Remark added successfully.",
    remarkIndex
  });

};
