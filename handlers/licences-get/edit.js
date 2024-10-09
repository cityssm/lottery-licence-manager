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
        response.redirect(`${urlPrefix}/licences/?error=licenceNotFound`);
        return;
    }
    else if (!licence.canUpdate) {
        response.redirect(`${urlPrefix}/licences/${licenceID.toString()}/?error=accessDenied`);
        return;
    }
    const organization = getOrganization(licence.organizationID, request.session);
    const feeCalculation = configFunctions.getProperty('licences.feeCalculationFn')(licence);
    const headTitle = configFunctions.getProperty('licences.externalLicenceNumber.isPreferredID')
        ? `Licence ${licence.externalLicenceNumber}`
        : `Licence #${licenceID.toString()}`;
    response.render('licence-edit', {
        headTitle: `${headTitle} Update`,
        isCreate: false,
        licence,
        organization,
        feeCalculation
    });
}
