"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getUndismissedOrganizationReminders = require("../../helpers/licencesDB/getUndismissedOrganizationReminders");
exports.handler = (req, res) => {
    const reminders = licencesDB_getUndismissedOrganizationReminders.getUndismissedOrganizationReminders(req.session);
    res.render("organization-reminders", {
        headTitle: "Organization Reminders",
        reminders
    });
};
