"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_getLicences = require("../../helpers/licencesDB/getLicences");
const licencesDB_getOrganization = require("../../helpers/licencesDB/getOrganization");
const licencesDB_getOrganizationRemarks = require("../../helpers/licencesDB/getOrganizationRemarks");
const licencesDB_getOrganizationReminders = require("../../helpers/licencesDB/getOrganizationReminders");
exports.handler = (req, res) => {
    const organizationID = parseInt(req.params.organizationID, 10);
    const organization = licencesDB_getOrganization.getOrganization(organizationID, req.session);
    if (!organization) {
        res.redirect("/organizations/?error=organizationNotFound");
        return;
    }
    if (!organization.canUpdate) {
        res.redirect("/organizations/" + organizationID.toString() + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = licencesDB_getLicences.getLicences({
        organizationID
    }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = licencesDB_getOrganizationRemarks.getOrganizationRemarks(organizationID, req.session) || [];
    const reminders = licencesDB_getOrganizationReminders.getOrganizationReminders(organizationID, req.session) || [];
    res.render("organization-edit", {
        headTitle: "Organization Update",
        isViewOnly: false,
        isCreate: false,
        organization,
        licences,
        remarks,
        reminders,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
};
