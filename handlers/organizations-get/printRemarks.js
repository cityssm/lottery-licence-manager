import * as configFunctions from "../../helpers/functions.config.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getOrganizationRemarks } from "../../helpers/licencesDB/getOrganizationRemarks.js";
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
export const handler = (request, response, next) => {
    const organizationID = Number(request.params.organizationID);
    if (Number.isNaN(organizationID)) {
        return next();
    }
    const organization = getOrganization(organizationID, request.session);
    if (!organization) {
        return response.redirect(urlPrefix + "/organizations/?error=organizationNotFound");
    }
    const remarks = getOrganizationRemarks(organizationID, request.session);
    response.render("organization-print-remarks", {
        headTitle: organization.organizationName,
        isViewOnly: true,
        organization,
        remarks,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
};
export default handler;
