"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_unissueLicence = require("../../helpers/licencesDB/unissueLicence");
exports.handler = (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = licencesDB_unissueLicence.unissueLicence(req.body.licenceID, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Licence Unissued Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Licence Not Unissued"
        });
    }
};
