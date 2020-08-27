"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getInactiveLocations = require("../../helpers/licencesDB/getInactiveLocations");
exports.handler = (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(licencesDB_getInactiveLocations.getInactiveLocations(inactiveYears));
};
