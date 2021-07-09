import * as configFunctions from "../../helpers/functions.config.js";
import { getEvent } from "../../helpers/licencesDB/getEvent.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");
export const handler = (request, response, next) => {
    const licenceID = Number(request.params.licenceID);
    const eventDate = Number(request.params.eventDate);
    if (Number.isNaN(licenceID) || Number.isNaN(eventDate)) {
        return next();
    }
    if (!request.session.user.userProperties.canUpdate) {
        return response.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
    }
    const eventObject = getEvent(licenceID, eventDate, request.session);
    if (!eventObject) {
        return response.redirect(urlPrefix + "/events/?error=eventNotFound");
    }
    if (!eventObject.canUpdate) {
        return response.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
    }
    const licence = getLicence(licenceID, request.session);
    const organization = getOrganization(licence.organizationID, request.session);
    response.render("event-edit", {
        headTitle: "Event Update",
        event: eventObject,
        licence,
        organization
    });
};
export default handler;
