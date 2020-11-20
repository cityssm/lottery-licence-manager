"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const issueLicence_1 = require("../../helpers/licencesDB/issueLicence");
const handler = (req, res) => {
    const success = issueLicence_1.issueLicence(req.body.licenceID, req.session);
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
exports.handler = handler;
