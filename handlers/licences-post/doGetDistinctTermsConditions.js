"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getDistinctTermsConditions = require("../../helpers/licencesDB/getDistinctTermsConditions");
exports.handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDB_getDistinctTermsConditions.getDistinctTermsConditions(organizationID));
};
