import type { RequestHandler } from "express";

import { updateOrganizationRemark } from "../../helpers/licencesDB/updateOrganizationRemark.js";


export const handler: RequestHandler = (request, response) => {

  const success = updateOrganizationRemark(request.body, request.session);

  return success
    ? response.json({
      success: true,
      message: "Remark updated successfully."
    })
    : response.json({
      success: false,
      message: "Remark could not be updated."
    });
};


export default handler;
