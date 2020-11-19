"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const addOrganizationBankRecord_1 = require("../../helpers/licencesDB/addOrganizationBankRecord");
exports.handler = (req, res) => {
    const success = addOrganizationBankRecord_1.addOrganizationBankRecord(req.body, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Record added successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Please make sure that the record you are trying to create does not already exist."
        });
    }
};
