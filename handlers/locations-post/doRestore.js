"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_restoreLocation = require("../../helpers/licencesDB/restoreLocation");
exports.handler = (req, res) => {
    const changeCount = licencesDB_restoreLocation.restoreLocation(req.body.locationID, req.session);
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
