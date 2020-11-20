"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateLocation_1 = require("../../helpers/licencesDB/updateLocation");
const handler = (req, res) => {
    const changeCount = updateLocation_1.updateLocation(req.body, req.session);
    if (changeCount) {
        return res.json({
            success: true,
            message: "Location updated successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Record Not Saved"
        });
    }
};
exports.handler = handler;
