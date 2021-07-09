import * as configFunctions from "../../helpers/functions.config.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
export const handler = (request, response, next) => {
    const licenceID = Number(request.params.licenceID);
    if (Number.isNaN(licenceID)) {
        return next();
    }
    const licence = getLicence(licenceID, request.session);
    if (!licence) {
        return response.redirect(urlPrefix + "/licences/?error=licenceNotFound");
    }
    const organization = getOrganization(licence.organizationID, request.session);
    const headTitle = configFunctions.getProperty("licences.externalLicenceNumber.isPreferredID")
        ? "Licence " + licence.externalLicenceNumber
        : "Licence #" + licenceID.toString();
    return response.render("licence-view", {
        headTitle,
        licence,
        organization
    });
};
export default handler;
