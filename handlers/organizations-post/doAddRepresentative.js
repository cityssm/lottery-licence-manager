"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const addOrganizationRepresentative_1 = require("../../helpers/licencesDB/addOrganizationRepresentative");
const handler = (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    const representativeObj = addOrganizationRepresentative_1.addOrganizationRepresentative(organizationID, req.body);
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
