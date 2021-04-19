import type { RequestHandler } from "express";

import { deleteOrganizationRemark } from "../../helpers/licencesDB/deleteOrganizationRemark.js";


export const handler: RequestHandler = (req, res) => {

  const organizationID = req.body.organizationID;
  const remarkIndex = req.body.remarkIndex;

  const success = deleteOrganizationRemark(organizationID, remarkIndex, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Remark deleted successfully."
    });

  } else {

    res.json({
      success: false,
      message: "Remark could not be deleted."
    });
  }
};
