"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicences_1 = require("../../helpers/licencesDB/getLicences");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const getOrganizationRemarks_1 = require("../../helpers/licencesDB/getOrganizationRemarks");
const getOrganizationReminders_1 = require("../../helpers/licencesDB/getOrganizationReminders");
const handler = (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    const organization = getOrganization_1.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    const licences = getLicences_1.getLicences({
        organizationID
    }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = getOrganizationRemarks_1.getOrganizationRemarks(organizationID, req.session) || [];
    const reminders = getOrganizationReminders_1.getOrganizationReminders(organizationID, req.session) || [];
    res.render("organization-view", {
        headTitle: organization.organizationName,
        isViewOnly: true,
        organization,
        licences,
        remarks,
        reminders,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
};
exports.handler = handler;
