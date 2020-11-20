"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const updateOrganizationReminder_1 = require("../../helpers/licencesDB/updateOrganizationReminder");
const getOrganizationReminder_1 = require("../../helpers/licencesDB/getOrganizationReminder");
const handler = (req, res) => {
    const success = updateOrganizationReminder_1.updateOrganizationReminder(req.body, req.session);
    if (success) {
        const reminder = getOrganizationReminder_1.getOrganizationReminder(req.body.organizationID, req.body.reminderIndex, req.session);
        return res.json({
            success: true,
            reminder
        });
    }
    else {
        res.json({ success: false });
    }
};
exports.handler = handler;
