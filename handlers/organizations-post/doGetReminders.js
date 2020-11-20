"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizationReminders_1 = require("../../helpers/licencesDB/getOrganizationReminders");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    res.json(getOrganizationReminders_1.getOrganizationReminders(organizationID, req.session));
};
exports.handler = handler;
