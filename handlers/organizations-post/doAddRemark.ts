import type { RequestHandler } from "express";

import { addOrganizationRemark } from "../../helpers/licencesDB/addOrganizationRemark";


export const handler: RequestHandler = (req, res) => {

  const remarkIndex = addOrganizationRemark(req.body, req.session);

  return res.json({
    success: true,
    message: "Remark added successfully.",
    remarkIndex
  });

};
