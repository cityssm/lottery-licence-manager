import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns";

import { pokeLicence } from "../../helpers/licencesDB/pokeLicence";


export const handler: RequestHandler = (req, res) => {

  const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");

  const licenceID = parseInt(req.params.licenceID, 10);

  pokeLicence(licenceID, req.session);

  res.redirect(urlPrefix + "/licences/" + licenceID.toString());
};
