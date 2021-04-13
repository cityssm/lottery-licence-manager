"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateOrganizationRepresentative_1 = require("../../helpers/licencesDB/updateOrganizationRepresentative");
const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    if (isNaN(organizationID)) {
        return next();
    }
    const representativeObj = updateOrganizationRepresentative_1.updateOrganizationRepresentative(organizationID, req.body);
    if (representativeObj) {
        res.json({
            success: true,
            organizationRepresentative: representativeObj
        });
    }
    else {
        res.json({
            success: false
        });
    }
};
exports.handler = handler;
