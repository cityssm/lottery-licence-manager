"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getOrganizationRemarks = require("../../helpers/licencesDB/getOrganizationRemarks");
exports.handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDB_getOrganizationRemarks.getOrganizationRemarks(organizationID, req.session));
};
