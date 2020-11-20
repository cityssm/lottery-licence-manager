"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getOrganizationReminder_1 = require("../../helpers/licencesDB/getOrganizationReminder");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const reminderIndex = req.body.reminderIndex;
    res.json(getOrganizationReminder_1.getOrganizationReminder(organizationID, reminderIndex, req.session));
};
exports.handler = handler;
