"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const unissueLicence_1 = require("../../helpers/licencesDB/unissueLicence");
const handler = (req, res) => {
    if (!req.session.user.userProperties.canCreate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const success = unissueLicence_1.unissueLicence(req.body.licenceID, req.session);
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
exports.handler = handler;
