"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const createLocation_1 = require("../../helpers/licencesDB/createLocation");
const handler = (req, res) => {
    const locationID = createLocation_1.createLocation(req.body, req.session);
    return res.json({
        success: true,
        locationID,
        locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
    });
};
exports.handler = handler;
