import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import * as configFunctions from '../../helpers/functions.config.js';
import getLicences from '../../helpers/licencesDB/getLicences.js';
import getOrganization from '../../helpers/licencesDB/getOrganization.js';
const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix');
export default function handler(request, response, next) {
    const organizationID = Number(request.params.organizationID);
    if (Number.isNaN(organizationID)) {
        next();
        return;
    }
    const organization = getOrganization(organizationID, request.session);
    if (!organization) {
        response.redirect(`${urlPrefix}/organizations/?error=organizationNotFound`);
        return;
    }
    const licences = getLicences({ organizationID }, request.session, {
        includeOrganization: false,
        limit: -1
    }).licences;
    response.render('organization-print', {
        headTitle: organization.organizationName,
        isViewOnly: true,
        organization,
        licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
}
