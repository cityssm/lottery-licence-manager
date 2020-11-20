"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getInactiveLocations_1 = require("../../helpers/licencesDB/getInactiveLocations");
const handler = (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(getInactiveLocations_1.getInactiveLocations(inactiveYears));
};
exports.handler = handler;
