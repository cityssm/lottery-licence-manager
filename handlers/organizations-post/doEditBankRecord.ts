import type { RequestHandler } from "express";

import { updateOrganizationBankRecord } from "../../helpers/licencesDB/updateOrganizationBankRecord.js";


export const handler: RequestHandler = (req, res) => {

  const success = updateOrganizationBankRecord(req.body, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Record updated successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Please try again."
    });

  }
};
