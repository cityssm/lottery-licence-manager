import * as configFns from "../../helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getLicences } from "../../helpers/licencesDB/getLicences.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks.js";
import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (req, res, next) => {
    const organizationID = Number(req.params.organizationID);
    if (isNaN(organizationID)) {
        return next();
    }
    const organization = getOrganization(organizationID, req.session);
    if (!organization) {
        return res.redirect(urlPrefix + "/organizations/?error=organizationNotFound");
    }
    if (!organization.canUpdate) {
        return res.redirect(urlPrefix + "/organizations/" + organizationID.toString() + "/?error=accessDenied-noUpdate");
    }
    const licences = getLicences({ organizationID }, req.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = getOrganizationRemarks(organizationID, req.session) || [];
    const reminders = getOrganizationReminders(organizationID, req.session) || [];
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
