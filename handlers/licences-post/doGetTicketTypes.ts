import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";


export const handler: RequestHandler = (req, res) => {

  const licenceTypeKey = req.body.licenceTypeKey;

  const licenceType = configFns.getLicenceType(licenceTypeKey);

  if (licenceType) {

    res.json(licenceType.ticketTypes || []);

  } else {

    res.json([]);
  }
};
