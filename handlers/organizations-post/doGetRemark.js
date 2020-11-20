"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizationRemark_1 = require("../../helpers/licencesDB/getOrganizationRemark");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    res.json(getOrganizationRemark_1.getOrganizationRemark(organizationID, remarkIndex, req.session));
};
exports.handler = handler;
