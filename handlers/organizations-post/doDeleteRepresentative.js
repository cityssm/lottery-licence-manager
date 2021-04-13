"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteOrganizationRepresentative_1 = require("../../helpers/licencesDB/deleteOrganizationRepresentative");
const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    const representativeIndex = Number(req.body.representativeIndex);
    if (isNaN(organizationID) || isNaN(representativeIndex)) {
        return next();
    }
    const success = deleteOrganizationRepresentative_1.deleteOrganizationRepresentative(organizationID, representativeIndex);
    res.json({
        success
    });
};
exports.handler = handler;
