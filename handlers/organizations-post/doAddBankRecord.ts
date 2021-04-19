import type { RequestHandler } from "express";

import { addOrganizationBankRecord } from "../../helpers/licencesDB/addOrganizationBankRecord.js";


export const handler: RequestHandler = (req, res) => {

  const success = addOrganizationBankRecord(req.body, req.session);

  if (success) {

    return res.json({
      success: true,
      message: "Record added successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Please make sure that the record you are trying to create does not already exist."
    });

  }
};
