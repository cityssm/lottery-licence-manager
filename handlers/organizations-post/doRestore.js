"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const restoreOrganization_1 = require("../../helpers/licencesDB/restoreOrganization");
const handler = (req, res) => {
    const success = restoreOrganization_1.restoreOrganization(req.body.organizationID, req.session);
    if (success) {
        return res.json({
            success: true,
            message: "Organization restored successfully."
        });
    }
    else {
        return res.json({
            success: false,
            message: "Organization could not be restored."
        });
    }
};
exports.handler = handler;
