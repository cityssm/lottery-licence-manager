"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB_getLicences = require("../../helpers/licencesDB/getLicences");
const licencesDB_getLocation = require("../../helpers/licencesDB/getLocation");
exports.handler = (req, res) => {
    const locationID = parseInt(req.params.locationID, 10);
    const location = licencesDB_getLocation.getLocation(locationID, req.session);
    if (!location) {
        res.redirect("/locations/?error=locationNotFound");
        return;
    }
    const licences = licencesDB_getLicences.getLicences({
        locationID
    }, req.session, {
        includeOrganization: true,
        limit: -1
    }).licences;
    res.render("location-view", {
        headTitle: location.locationDisplayName,
        location,
        licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date())
    });
};
