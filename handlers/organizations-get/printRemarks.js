import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import { getProperty } from '../../helpers/functions.config.js';
import getOrganization from '../../helpers/licencesDB/getOrganization.js';
import getOrganizationRemarks from '../../helpers/licencesDB/getOrganizationRemarks.js';
const urlPrefix = getProperty('reverseProxy.urlPrefix');
export default function handler(request, response, next) {
    const organizationID = Number(request.params.organizationID);
    if (Number.isNaN(organizationID)) {
        next();
        return;
    }
    const organization = getOrganization(organizationID, request.session.user);
    if (organization === undefined) {
        response.redirect(`${urlPrefix}/organizations/?error=organizationNotFound`);
        return;
    }
    const remarks = getOrganizationRemarks(organizationID, request.session.user);
    response.render('organization-print-remarks', {
        headTitle: organization.organizationName,
        isViewOnly: true,
        organization,
        remarks,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
}
