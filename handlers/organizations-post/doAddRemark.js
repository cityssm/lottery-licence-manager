"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const addOrganizationRemark_1 = require("../../helpers/licencesDB/addOrganizationRemark");
const handler = (req, res) => {
    const remarkIndex = addOrganizationRemark_1.addOrganizationRemark(req.body, req.session);
    return res.json({
        success: true,
        message: "Remark added successfully.",
        remarkIndex
    });
};
exports.handler = handler;
