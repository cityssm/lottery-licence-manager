"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_getEvent = require("../../helpers/licencesDB/getEvent");
const licencesDB_getLicence = require("../../helpers/licencesDB/getLicence");
const licencesDB_getOrganization = require("../../helpers/licencesDB/getOrganization");
exports.handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    if (!req.session.user.userProperties.canUpdate) {
        res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
        return;
    }
    const eventObj = licencesDB_getEvent.getEvent(licenceID, eventDate, req.session);
    if (!eventObj) {
        res.redirect("/events/?error=eventNotFound");
        return;
    }
    if (!eventObj.canUpdate) {
        res.redirect("/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
        return;
    }
    const licence = licencesDB_getLicence.getLicence(licenceID, req.session);
    const organization = licencesDB_getOrganization.getOrganization(licence.organizationID, req.session);
    res.render("event-edit", {
        headTitle: "Event Update",
        event: eventObj,
        licence,
        organization
    });
};
