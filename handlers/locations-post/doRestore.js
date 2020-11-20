"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const restoreLocation_1 = require("../../helpers/licencesDB/restoreLocation");
const handler = (req, res) => {
    const changeCount = restoreLocation_1.restoreLocation(req.body.locationID, req.session);
    if (changeCount) {
        return res.json({
            success: true,
            message: "Location restored successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Location could not be restored."
        });
    }
};
exports.handler = handler;
