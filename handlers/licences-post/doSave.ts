import type { RequestHandler } from "express";

import * as licencesDB_createLicence from "../../helpers/licencesDB/createLicence";
import * as licencesDB_updateLicence from "../../helpers/licencesDB/updateLicence";


export const handler: RequestHandler = (req, res) => {

 if (req.body.licenceID === "") {

   const newLicenceID = licencesDB_createLicence.createLicence(req.body, req.session);

   res.json({
     success: true,
     licenceID: newLicenceID
   });

 } else {

   const changeCount = licencesDB_updateLicence.updateLicence(req.body, req.session);

   if (changeCount) {

     res.json({
       success: true,
       message: "Licence updated successfully."
     });

   } else {

     res.json({
       success: false,
       message: "Record Not Saved"
     });

   }
 }
};
