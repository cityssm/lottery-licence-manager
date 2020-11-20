"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteLocation_1 = require("../../helpers/licencesDB/deleteLocation");
const handler = (req, res) => {
    const changeCount = deleteLocation_1.deleteLocation(req.body.locationID, req.session);
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
exports.handler = handler;
