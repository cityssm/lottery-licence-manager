import type { RequestHandler } from "express";

import * as licencesDB_mergeLocations from "../../helpers/licencesDB/mergeLocations";


export const handler: RequestHandler = (req, res) => {

 const targetLocationID = req.body.targetLocationID;
 const sourceLocationID = req.body.sourceLocationID;

 const success = licencesDB_mergeLocations.mergeLocations(targetLocationID, sourceLocationID, req.session);

 res.json({
   success
 });
};
