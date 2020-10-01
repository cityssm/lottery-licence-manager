"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const rollForwardOrganization_1 = require("../../helpers/licencesDB/rollForwardOrganization");
exports.handler = (req, res) => {
    const organizationID = parseInt(req.body.organizationID, 10);
    const updateFiscalYear = req.body.updateFiscalYear === "1";
    const updateReminders = req.body.updateReminders === "1";
    const result = rollForwardOrganization_1.rollForwardOrganization(organizationID, updateFiscalYear, updateReminders, req.session);
    return res.json(result);
};
