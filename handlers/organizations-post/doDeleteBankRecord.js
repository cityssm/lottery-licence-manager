"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteOrganizationBankRecord_1 = require("../../helpers/licencesDB/deleteOrganizationBankRecord");
const handler = (req, res) => {
    const success = deleteOrganizationBankRecord_1.deleteOrganizationBankRecord(req.body.organizationID, req.body.recordIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Organization updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Record Not Saved"
        });
    }
};
exports.handler = handler;
