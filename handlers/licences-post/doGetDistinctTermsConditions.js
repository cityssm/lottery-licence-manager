"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getDistinctTermsConditions_1 = require("../../helpers/licencesDB/getDistinctTermsConditions");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getDistinctTermsConditions_1.getDistinctTermsConditions(organizationID));
};
exports.handler = handler;
