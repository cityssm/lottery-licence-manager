import type { RequestHandler } from "express";

import { deleteOrganizationBankRecord } from "../../helpers/licencesDB/deleteOrganizationBankRecord.js";


export const handler: RequestHandler = (request, response) => {

  const success =
    deleteOrganizationBankRecord(request.body.organizationID, request.body.recordIndex, request.session);

  return success
    ? response.json({
      success: true,
      message: "Organization updated successfully."
    })
    : response.json({
      success: false,
      message: "Record Not Saved"
    });
};


export default handler;
