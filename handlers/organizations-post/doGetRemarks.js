"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizationRemarks_1 = require("../../helpers/licencesDB/getOrganizationRemarks");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getOrganizationRemarks_1.getOrganizationRemarks(organizationID, req.session));
};
exports.handler = handler;
