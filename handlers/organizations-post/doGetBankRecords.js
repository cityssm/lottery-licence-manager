"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizationBankRecords_1 = require("../../helpers/licencesDB/getOrganizationBankRecords");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const bankingYear = req.body.bankingYear;
    const accountNumber = req.body.accountNumber;
    res.json(getOrganizationBankRecords_1.getOrganizationBankRecords(organizationID, accountNumber, bankingYear));
};
exports.handler = handler;
