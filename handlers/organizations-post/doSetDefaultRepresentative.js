"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const setDefaultOrganizationRepresentative_1 = require("../../helpers/licencesDB/setDefaultOrganizationRepresentative");
const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    const isDefaultRepresentativeIndex = Number(req.body.isDefaultRepresentativeIndex);
    if (isNaN(organizationID) || isNaN(isDefaultRepresentativeIndex)) {
        return next();
    }
    const success = setDefaultOrganizationRepresentative_1.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    res.json({
        success
    });
};
exports.handler = handler;
