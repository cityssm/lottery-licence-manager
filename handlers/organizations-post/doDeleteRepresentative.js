"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteOrganizationRepresentative_1 = require("../../helpers/licencesDB/deleteOrganizationRepresentative");
const handler = (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeIndex = req.body.representativeIndex;
    const success = deleteOrganizationRepresentative_1.deleteOrganizationRepresentative(organizationID, representativeIndex);
    res.json({
        success
    });
};
exports.handler = handler;
