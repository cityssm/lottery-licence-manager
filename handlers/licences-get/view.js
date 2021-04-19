import * as configFns from "../../helpers/configFns.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (req, res, next) => {
    const licenceID = Number(req.params.licenceID);
    if (isNaN(licenceID)) {
        return next();
    }
    const licence = getLicence(licenceID, req.session);
    if (!licence) {
        return res.redirect(urlPrefix + "/licences/?error=licenceNotFound");
    }
    const organization = getOrganization(licence.organizationID, req.session);
    const headTitle = configFns.getProperty("licences.externalLicenceNumber.isPreferredID")
        ? "Licence " + licence.externalLicenceNumber
        : "Licence #" + licenceID.toString();
    return res.render("licence-view", {
        headTitle,
        licence,
        organization
    });
};
