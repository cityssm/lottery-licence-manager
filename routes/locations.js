"use strict";
const express = require("express");
const router = express.Router();
const configFns_1 = require("../helpers/configFns");
const dateTimeFns_1 = require("../helpers/dateTimeFns");
const stringFns_1 = require("../helpers/stringFns");
const licencesDB_1 = require("../helpers/licencesDB");
router.get("/", function (_req, res) {
    res.render("location-search", {
        headTitle: "Locations"
    });
});
router.post("/doGetLocations", function (req, res) {
    const locations = licencesDB_1.licencesDB.getLocations(req.body, req.session);
    res.json(locations);
});
router.post("/doCreate", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const locationID = licencesDB_1.licencesDB.createLocation(req.body, req.session);
    res.json({
        success: true,
        locationID: locationID,
        locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
    });
});
router.post("/doUpdate", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json({
            success: false,
            message: "Not Allowed"
        });
        return;
    }
    const changeCount = licencesDB_1.licencesDB.updateLocation(req.body, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Location updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Record Not Saved"
        });
    }
});
router.post("/doDelete", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.json("not allowed");
        return;
    }
    const changeCount = licencesDB_1.licencesDB.deleteLocation(req.body.locationID, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Location deleted successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Location could not be deleted."
        });
    }
});
router.post("/doRestore", function (req, res) {
    if (req.session.user.userProperties.canUpdate !== "true") {
        res.json("not allowed");
        return;
    }
    const changeCount = licencesDB_1.licencesDB.restoreLocation(req.body.locationID, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Location restored successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Location could not be restored."
        });
    }
});
router.post("/doMerge", function (req, res) {
    if (req.session.user.userProperties.isAdmin !== "true") {
        res.json("not allowed");
        return;
    }
    const targetLocationID = req.body.targetLocationID;
    const sourceLocationID = req.body.sourceLocationID;
    const success = licencesDB_1.licencesDB.mergeLocations(targetLocationID, sourceLocationID, req.session);
    res.json({
        success: success
    });
});
router.get("/new", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res.redirect("/locations/?error=accessDenied-noCreate");
        return;
    }
    res.render("location-edit", {
        headTitle: "Create a New Location",
        location: {
            locationCity: configFns_1.configFns.getProperty("defaults.city"),
            locationProvince: configFns_1.configFns.getProperty("defaults.province")
        },
        currentDateInteger: dateTimeFns_1.dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns_1.stringFns,
        isCreate: true
    });
});
router.get("/:locationID", function (req, res) {
    const locationID = parseInt(req.params.locationID);
    const location = licencesDB_1.licencesDB.getLocation(locationID, req.session);
    if (!location) {
        res.redirect("/locations/?error=locationNotFound");
        return;
    }
    const licences = licencesDB_1.licencesDB.getLicences({
        locationID: locationID
    }, true, false, req.session);
    res.render("location-view", {
        headTitle: location.locationDisplayName,
        location: location,
        licences: licences,
        currentDateInteger: dateTimeFns_1.dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns_1.stringFns
    });
});
router.get("/:locationID/edit", function (req, res) {
    const locationID = parseInt(req.params.locationID);
    if (req.session.user.userProperties.canCreate !== "true") {
        res.redirect("/locations/" + locationID + "/?error=accessDenied-noCreate");
        return;
    }
    const location = licencesDB_1.licencesDB.getLocation(locationID, req.session);
    if (!location) {
        res.redirect("/locations/?error=locationNotFound");
        return;
    }
    if (!location.canUpdate) {
        res.redirect("/locations/" + locationID + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = licencesDB_1.licencesDB.getLicences({
        locationID: locationID
    }, true, false, req.session) || [];
    res.render("location-edit", {
        headTitle: location.locationDisplayName,
        location: location,
        licences: licences,
        currentDateInteger: dateTimeFns_1.dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns_1.stringFns,
        isCreate: false
    });
});
module.exports = router;
