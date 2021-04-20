import type { RequestHandler } from "express";

import { deleteOrganizationBankRecord } from "../../helpers/licencesDB/deleteOrganizationBankRecord.js";


export const handler: RequestHandler = (req, res) => {

  const success =
    deleteOrganizationBankRecord(req.body.organizationID, req.body.recordIndex, req.session);

  if (success) {
    res.json({
      success: true,
      message: "Organization updated successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Record Not Saved"
    });
  }
};


export default handler;
