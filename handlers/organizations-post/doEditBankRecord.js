"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateOrganizationBankRecord_1 = require("../../helpers/licencesDB/updateOrganizationBankRecord");
const handler = (req, res) => {
    const success = updateOrganizationBankRecord_1.updateOrganizationBankRecord(req.body, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Record updated successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Please try again."
        });
    }
};
exports.handler = handler;
