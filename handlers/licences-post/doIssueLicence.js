"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_issueLicence = require("../../helpers/licencesDB/issueLicence");
exports.handler = (req, res) => {
    const success = licencesDB_issueLicence.issueLicence(req.body.licenceID, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Licence Issued Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Licence Not Issued"
        });
    }
};
