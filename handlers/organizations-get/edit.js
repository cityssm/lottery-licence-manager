"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicences_1 = require("../../helpers/licencesDB/getLicences");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const getOrganizationRemarks_1 = require("../../helpers/licencesDB/getOrganizationRemarks");
const getOrganizationReminders_1 = require("../../helpers/licencesDB/getOrganizationReminders");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    if (isNaN(organizationID)) {
        return next();
    }
    const organization = getOrganization_1.getOrganization(organizationID, req.session);
    if (!organization) {
        return res.redirect(urlPrefix + "/organizations/?error=organizationNotFound");
    }
    if (!organization.canUpdate) {
        return res.redirect(urlPrefix + "/organizations/" + organizationID.toString() + "/?error=accessDenied-noUpdate");
    }
    const licences = getLicences_1.getLicences({ organizationID }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = getOrganizationRemarks_1.getOrganizationRemarks(organizationID, req.session) || [];
    const reminders = getOrganizationReminders_1.getOrganizationReminders(organizationID, req.session) || [];
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
exports.handler = handler;
