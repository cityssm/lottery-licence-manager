"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_createLicence = require("../../helpers/licencesDB/createLicence");
const licencesDB_updateLicence = require("../../helpers/licencesDB/updateLicence");
exports.handler = (req, res) => {
    if (req.body.licenceID === "") {
        const newLicenceID = licencesDB_createLicence.createLicence(req.body, req.session);
        res.json({
            success: true,
            licenceID: newLicenceID
        });
    }
    else {
        const changeCount = licencesDB_updateLicence.updateLicence(req.body, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Licence updated successfully."
            });
        }
        else {
            res.json({
                success: false,
                message: "Record Not Saved"
            });
        }
    }
};
