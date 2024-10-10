import { getProperty } from '../../helpers/functions.config.js';
import getEvent from '../../helpers/licencesDB/getEvent.js';
import getLicence from '../../helpers/licencesDB/getLicence.js';
import getOrganization from '../../helpers/licencesDB/getOrganization.js';
const urlPrefix = getProperty('reverseProxy.urlPrefix');
export default function handler(request, response, next) {
    const licenceID = Number(request.params.licenceID);
    const eventDate = Number(request.params.eventDate);
    if (Number.isNaN(licenceID) || Number.isNaN(eventDate)) {
        next();
        return;
    }
    if (!request.session.user.userProperties.canUpdate) {
        response.redirect(`${urlPrefix}/events/${licenceID.toString()}/${eventDate.toString()}/?error=accessDenied`);
        return;
    }
    const eventObject = getEvent(licenceID, eventDate, request.session.user);
    if (eventObject === undefined) {
        response.redirect(`${urlPrefix}/events/?error=eventNotFound`);
        return;
    }
    if (!eventObject.canUpdate) {
        response.redirect(`${urlPrefix}/events/${licenceID.toString()}/${eventDate.toString()}/?error=accessDenied`);
        return;
    }
    const licence = getLicence(licenceID, request.session.user);
    if (licence === undefined) {
        response.redirect(`${urlPrefix}/events/?error=licenceNotFound`);
        return;
    }
    const organization = getOrganization(licence.organizationID, request.session.user);
    response.render('event-edit', {
        headTitle: 'Event Update',
        event: eventObject,
        licence,
        organization
    });
}
