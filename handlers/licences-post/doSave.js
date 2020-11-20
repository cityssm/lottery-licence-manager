"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const createLicence_1 = require("../../helpers/licencesDB/createLicence");
const updateLicence_1 = require("../../helpers/licencesDB/updateLicence");
const handler = (req, res) => {
    if (req.body.licenceID === "") {
        const newLicenceID = createLicence_1.createLicence(req.body, req.session);
        res.json({
            success: true,
            licenceID: newLicenceID
        });
    }
    else {
        const changeCount = updateLicence_1.updateLicence(req.body, req.session);
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
exports.handler = handler;
