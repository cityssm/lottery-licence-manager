"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_deleteLicence = require("../../helpers/licencesDB/deleteLicence");
exports.handler = (req, res) => {
    if (req.body.licenceID === "") {
        res.json({
            success: false,
            message: "Licence ID Unavailable"
        });
    }
    else {
        const changeCount = licencesDB_deleteLicence.deleteLicence(req.body.licenceID, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Licence Deleted"
            });
        }
        else {
            res.json({
                success: false,
                message: "Licence Not Deleted"
            });
        }
    }
};
