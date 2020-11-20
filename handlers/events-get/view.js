"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getEvent_1 = require("../../helpers/licencesDB/getEvent");
const getLicence_1 = require("../../helpers/licencesDB/getLicence");
const getOrganization_1 = require("../../helpers/licencesDB/getOrganization");
const handler = (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    const eventObj = getEvent_1.getEvent(licenceID, eventDate, req.session);
    if (!eventObj) {
        return res.redirect("/events/?error=eventNotFound");
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
