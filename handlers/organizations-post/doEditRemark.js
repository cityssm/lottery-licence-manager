"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateOrganizationRemark_1 = require("../../helpers/licencesDB/updateOrganizationRemark");
const handler = (req, res) => {
    const success = updateOrganizationRemark_1.updateOrganizationRemark(req.body, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Remark updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Remark could not be updated."
        });
    }
};
exports.handler = handler;
