import type { RequestHandler } from "express";

import { deleteOrganizationRemark } from "../../helpers/licencesDB/deleteOrganizationRemark.js";


export const handler: RequestHandler = (request, response) => {

  const organizationID = request.body.organizationID;
  const remarkIndex = request.body.remarkIndex;

  const success = deleteOrganizationRemark(organizationID, remarkIndex, request.session);

  return success
    ? response.json({
      success: true,
      message: "Remark deleted successfully."
    })
    : response.json({
      success: false,
      message: "Remark could not be deleted."
    });
};


export default handler;
