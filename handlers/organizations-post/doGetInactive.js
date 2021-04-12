"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getInactiveOrganizations_1 = require("../../helpers/licencesDB/getInactiveOrganizations");
const handler = (req, res) => {
    const inactiveYears = parseInt(req.body.inactiveYears, 10);
    res.json(getInactiveOrganizations_1.getInactiveOrganizations(inactiveYears));
};
exports.handler = handler;
