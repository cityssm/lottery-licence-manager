import type { RequestHandler } from "express";

import { addOrganizationBankRecord } from "../../helpers/licencesDB/addOrganizationBankRecord.js";


export const handler: RequestHandler = (request, response) => {

  const success = addOrganizationBankRecord(request.body, request.session);

  return success
    ? response.json({
      success: true,
      message: "Record added successfully."
    })
    : response.json({
      success: false,
      message: "Please make sure that the record you are trying to create does not already exist."
    });
};


export default handler;
