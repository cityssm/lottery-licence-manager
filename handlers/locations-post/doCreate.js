"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_createLocation = require("../../helpers/licencesDB/createLocation");
exports.handler = (req, res) => {
    const locationID = licencesDB_createLocation.createLocation(req.body, req.session);
    return res.json({
        success: true,
        locationID,
        locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
    });
};
