"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteOrganizationRemark_1 = require("../../helpers/licencesDB/deleteOrganizationRemark");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const remarkIndex = req.body.remarkIndex;
    const success = deleteOrganizationRemark_1.deleteOrganizationRemark(organizationID, remarkIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Remark deleted successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Remark could not be deleted."
        });
    }
};
exports.handler = handler;
