import * as configFns from "../../helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getLicences } from "../../helpers/licencesDB/getLicences.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks.js";
import { getOrganizationReminders } from "../../helpers/licencesDB/getOrganizationReminders.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (request, response, next) => {
    const organizationID = Number(request.params.organizationID);
    if (Number.isNaN(organizationID)) {
        return next();
    }
    const organization = getOrganization(organizationID, request.session);
    if (!organization) {
        return response.redirect(urlPrefix + "/organizations/?error=organizationNotFound");
    }
    if (!organization.canUpdate) {
        return response.redirect(urlPrefix + "/organizations/" + organizationID.toString() + "/?error=accessDenied-noUpdate");
    }
    const licences = getLicences({ organizationID }, request.session, {
        includeOrganization: false,
        limit: -1
    }).licences || [];
    const remarks = getOrganizationRemarks(organizationID, request.session) || [];
    const reminders = getOrganizationReminders(organizationID, request.session) || [];
    response.render("organization-edit", {
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
export default handler;
