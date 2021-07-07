import * as configFns from "../../helpers/configFns.js";
import { getEvent } from "../../helpers/licencesDB/getEvent.js";
import { getLicence } from "../../helpers/licencesDB/getLicence.js";
import { getOrganization } from "../../helpers/licencesDB/getOrganization.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (request, response, next) => {
    const licenceID = Number(request.params.licenceID);
    const eventDate = Number(request.params.eventDate);
    if (Number.isNaN(licenceID) || Number.isNaN(eventDate)) {
        return next();
    }
    const eventObject = getEvent(licenceID, eventDate, request.session);
    if (!eventObject) {
        return response.redirect(urlPrefix + "/events/?error=eventNotFound");
    }
    const licence = getLicence(licenceID, request.session);
    const organization = getOrganization(licence.organizationID, request.session);
    response.render("event-view", {
        headTitle: "Event View",
        event: eventObject,
        licence,
        organization
    });
};
export default handler;
