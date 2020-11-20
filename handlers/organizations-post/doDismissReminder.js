"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dismissOrganizationReminder_1 = require("../../helpers/licencesDB/dismissOrganizationReminder");
const getOrganizationReminder_1 = require("../../helpers/licencesDB/getOrganizationReminder");
const handler = (req, res) => {
    const organizationID = req.body.organizationID;
    const reminderIndex = req.body.reminderIndex;
    const success = dismissOrganizationReminder_1.dismissOrganizationReminder(organizationID, reminderIndex, req.session);
    if (success) {
        const reminder = getOrganizationReminder_1.getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);
        res.json({
            success: true,
            message: "Reminder dismissed.",
            reminder
        });
    }
    else {
        res.json({
            success: false,
            message: "Reminder could not be dismissed."
        });
    }
};
exports.handler = handler;
