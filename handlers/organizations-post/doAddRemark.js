"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDBOrganizations = require("../../helpers/licencesDB-organizations");
exports.handler = (req, res) => {
    const remarkIndex = licencesDBOrganizations.addOrganizationRemark(req.body, req.session);
    return res.json({
        success: true,
        message: "Remark added successfully.",
        remarkIndex
    });
};
