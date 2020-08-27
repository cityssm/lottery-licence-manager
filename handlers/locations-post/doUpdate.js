"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_updateLocation = require("../../helpers/licencesDB/updateLocation");
exports.handler = (req, res) => {
    const changeCount = licencesDB_updateLocation.updateLocation(req.body, req.session);
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
