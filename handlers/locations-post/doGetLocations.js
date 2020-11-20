"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getLocations_1 = require("../../helpers/licencesDB/getLocations");
const handler = (req, res) => {
    const locations = getLocations_1.getLocations(req.session, {
        limit: req.body.limit || -1,
        offset: req.body.offset || 0,
        locationNameAddress: req.body.locationNameAddress,
        locationIsDistributor: ("locationIsDistributor" in req.body && req.body.locationIsDistributor !== ""
            ? parseInt(req.body.locationIsDistributor, 10)
            : -1),
        locationIsManufacturer: ("locationIsManufacturer" in req.body && req.body.locationIsManufacturer !== ""
            ? parseInt(req.body.locationIsManufacturer, 10)
            : -1),
        locationIsActive: req.body.locationIsActive || ""
    });
    res.json(locations);
};
exports.handler = handler;
