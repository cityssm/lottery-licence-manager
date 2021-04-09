"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteOrganization_1 = require("../../helpers/licencesDB/deleteOrganization");
const handler = (req, res) => {
    const success = deleteOrganization_1.deleteOrganization(req.body.organizationID, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Organization deleted successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Organization could not be deleted."
        });
    }
};
exports.handler = handler;
