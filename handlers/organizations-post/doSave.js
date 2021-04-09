"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const createOrganization_1 = require("../../helpers/licencesDB/createOrganization");
const updateOrganization_1 = require("../../helpers/licencesDB/updateOrganization");
const handler = (req, res) => {
    if (req.body.organizationID === "") {
        const newOrganizationID = createOrganization_1.createOrganization(req.body, req.session);
        res.json({
            success: true,
            organizationID: newOrganizationID
        });
    }
    else {
        const success = updateOrganization_1.updateOrganization(req.body, req.session);
        if (success) {
            return res.json({
                success: true,
                message: "Organization updated successfully."
            });
        }
        else {
            return res.json({
                success: false,
                message: "Record Not Saved"
            });
        }
    }
};
exports.handler = handler;
