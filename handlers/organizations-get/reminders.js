"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getUndismissedOrganizationReminders_1 = require("../../helpers/licencesDB/getUndismissedOrganizationReminders");
const handler = (req, res) => {
    const reminders = getUndismissedOrganizationReminders_1.getUndismissedOrganizationReminders(req.session);
    res.render("organization-reminders", {
        headTitle: "Organization Reminders",
        reminders
    });
};
exports.handler = handler;
