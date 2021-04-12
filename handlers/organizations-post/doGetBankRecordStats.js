"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizationBankRecordStats_1 = require("../../helpers/licencesDB/getOrganizationBankRecordStats");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getOrganizationBankRecordStats_1.getOrganizationBankRecordStats(organizationID));
};
exports.handler = handler;
