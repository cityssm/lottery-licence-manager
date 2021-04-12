"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getDeletedOrganizations_1 = require("../../helpers/licencesDB/getDeletedOrganizations");
const handler = (_req, res) => {
    const organizations = getDeletedOrganizations_1.getDeletedOrganizations();
    res.render("organization-recovery", {
        headTitle: "Organization Recovery",
        organizations
    });
};
exports.handler = handler;
