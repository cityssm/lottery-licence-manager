"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const getEvent_1 = require("../../helpers/licencesDB/getEvent");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = (req, res, next) => {
    const licenceID = Number(req.params.licenceID);
    const eventDate = Number(req.params.eventDate);
    if (isNaN(licenceID) || isNaN(eventDate)) {
        return next();
    }
    const eventObj = getEvent_1.getEvent(licenceID, eventDate, req.session);
    if (!eventObj) {
        return res.redirect(urlPrefix + "/events/?error=eventNotFound");
    }
    const licence = getLicence_1.getLicence(licenceID, req.session);
    const organization = getOrganization_1.getOrganization(licence.organizationID, req.session);
    res.render("event-view", {
        headTitle: "Event View",
        event: eventObj,
        licence,
        organization
    });
};
exports.handler = handler;
