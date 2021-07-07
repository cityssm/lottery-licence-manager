import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";

import { pokeLicence } from "../../helpers/licencesDB/pokeLicence.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (request, response, next) => {

  const licenceID = Number(request.params.licenceID);

  if (Number.isNaN(licenceID)) {
    return next();
  }

  pokeLicence(licenceID, request.session);

  return response.redirect(urlPrefix + "/licences/" + licenceID.toString());
};


export default handler;
