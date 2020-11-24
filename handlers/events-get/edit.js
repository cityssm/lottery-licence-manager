"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const getEvent_1 = require("../../helpers/licencesDB/getEvent");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const handler = (req, res) => {
    const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    if (!req.session.user.userProperties.canUpdate) {
        res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
        return;
    }
    const eventObj = getEvent_1.getEvent(licenceID, eventDate, req.session);
    if (!eventObj) {
        res.redirect(urlPrefix + "/events/?error=eventNotFound");
        return;
    }
    if (!eventObj.canUpdate) {
        res.redirect(urlPrefix + "/events/" + licenceID.toString() + "/" + eventDate.toString() + "/?error=accessDenied");
        return;
    }
    const licence = getLicence_1.getLicence(licenceID, req.session);
    const organization = getOrganization_1.getOrganization(licence.organizationID, req.session);
    res.render("event-edit", {
        headTitle: "Event Update",
        event: eventObj,
        licence,
        organization
    });
};
exports.handler = handler;
