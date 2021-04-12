"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const setDefaultOrganizationRepresentative_1 = require("../../helpers/licencesDB/setDefaultOrganizationRepresentative");
const handler = (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;
    const success = setDefaultOrganizationRepresentative_1.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);
    res.json({
        success
    });
};
exports.handler = handler;
