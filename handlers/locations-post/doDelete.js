"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_deleteLocation = require("../../helpers/licencesDB/deleteLocation");
exports.handler = (req, res) => {
    const changeCount = licencesDB_deleteLocation.deleteLocation(req.body.locationID, req.session);
    if (changeCount) {
        return res.json({
            success: true,
            message: "Location deleted successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Location could not be deleted."
        });
    }
};
