import type { RequestHandler } from "express";

import { updateOrganizationRemark } from "../../helpers/licencesDB/updateOrganizationRemark.js";


export const handler: RequestHandler = (req, res) => {

  const success = updateOrganizationRemark(req.body, req.session);

  if (success) {

    res.json({
      success: true,
      message: "Remark updated successfully."
    });

  } else {

    res.json({
      success: false,
      message: "Remark could not be updated."
    });
  }
};


export default handler;
