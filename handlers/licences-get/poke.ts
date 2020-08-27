import type { RequestHandler } from "express";

import * as licencesDB_pokeLicence from "../../helpers/licencesDB/pokeLicence";


export const handler: RequestHandler = (req, res) => {

  const licenceID = parseInt(req.params.licenceID, 10);

  licencesDB_pokeLicence.pokeLicence(licenceID, req.session);

  res.redirect("/licences/" + licenceID.toString());
};
