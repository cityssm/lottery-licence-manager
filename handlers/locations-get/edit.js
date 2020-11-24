"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicences_1 = require("../../helpers/licencesDB/getLicences");
const getLocation_1 = require("../../helpers/licencesDB/getLocation");
const handler = (req, res) => {
    const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
    const locationID = parseInt(req.params.locationID, 10);
    const location = getLocation_1.getLocation(locationID, req.session);
    if (!location) {
        res.redirect(urlPrefix + "/locations/?error=locationNotFound");
        return;
    }
    if (!location.canUpdate) {
        res.redirect(urlPrefix + "/locations/" + locationID.toString() + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = getLicences_1.getLicences({
        locationID
    }, req.session, {
        includeOrganization: true,
        limit: -1
    }).licences;
    res.render("location-edit", {
        headTitle: location.locationDisplayName,
        location,
        licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date()),
        isCreate: false
    });
};
exports.handler = handler;
