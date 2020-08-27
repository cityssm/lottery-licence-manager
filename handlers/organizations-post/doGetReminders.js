"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getOrganizationReminders = require("../../helpers/licencesDB/getOrganizationReminders");
exports.handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(licencesDB_getOrganizationReminders.getOrganizationReminders(organizationID, req.session));
};
