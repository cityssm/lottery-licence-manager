import * as configFunctions from '../../helpers/functions.config.js';
import getLicence from '../../helpers/licencesDB/getLicence.js';
import { getOrganization } from '../../helpers/licencesDB/getOrganization.js';
const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix');
export default function handler(request, response, next) {
    const licenceID = Number(request.params.licenceID);
    if (Number.isNaN(licenceID)) {
        next();
        return;
    }
    const licence = getLicence(licenceID, request.session);
    if (licence === undefined) {
        response.redirect(urlPrefix + '/licences/?error=licenceNotFound');
        return;
    }
    const organization = getOrganization(licence.organizationID, request.session);
    const headTitle = configFunctions.getProperty('licences.externalLicenceNumber.isPreferredID')
        ? `Licence ${licence.externalLicenceNumber}`
        : `Licence #${licenceID.toString()}`;
    response.render('licence-view', {
        headTitle,
        licence,
        organization
    });
}
