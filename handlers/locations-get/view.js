"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const getLicences_1 = require("../../helpers/licencesDB/getLicences");
const getLocation_1 = require("../../helpers/licencesDB/getLocation");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const handler = (req, res, next) => {
    const locationID = Number(req.params.locationID);
    if (isNaN(locationID)) {
        return next();
    }
    const location = getLocation_1.getLocation(locationID, req.session);
    if (!location) {
        return res.redirect(urlPrefix + "/locations/?error=locationNotFound");
    }
    const licences = getLicences_1.getLicences({
        locationID
    }, req.session, {
        includeOrganization: true,
        limit: -1
    }).licences;
    return res.render("location-view", {
        headTitle: location.locationDisplayName,
        location,
        licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
};
exports.handler = handler;
