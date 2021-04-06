"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getEventFinancialSummary_1 = require("../../helpers/licencesDB/getEventFinancialSummary");
const handler = (req, res) => {
    const summary = getEventFinancialSummary_1.getEventFinancialSummary(req.body);
    res.json(summary);
};
exports.handler = handler;
