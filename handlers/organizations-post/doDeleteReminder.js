"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const deleteOrganizationReminder_1 = require("../../helpers/licencesDB/deleteOrganizationReminder");
const handler = (req, res) => {
    const success = deleteOrganizationReminder_1.deleteOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);
    return res.json({ success });
};
exports.handler = handler;
