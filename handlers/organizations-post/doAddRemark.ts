import type { RequestHandler } from "express";

import { addOrganizationRemark } from "../../helpers/licencesDB/addOrganizationRemark.js";


export const handler: RequestHandler = (request, response) => {

  const remarkIndex = addOrganizationRemark(request.body, request.session);

  return response.json({
    success: true,
    message: "Remark added successfully.",
    remarkIndex
  });

};


export default handler;
