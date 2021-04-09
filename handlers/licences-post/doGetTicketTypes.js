"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const handler = (req, res) => {
    const licenceTypeKey = req.body.licenceTypeKey;
    const licenceType = configFns.getLicenceType(licenceTypeKey);
    if (licenceType) {
        res.json(licenceType.ticketTypes || []);
    }
    else {
        res.json([]);
    }
};
exports.handler = handler;
