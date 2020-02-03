"use strict";
const express = require("express");
const router = express.Router();
const configFns = require("../helpers/configFns");
const dateTimeFns = require("../helpers/dateTimeFns");
const stringFns = require("../helpers/stringFns");
const licencesDB = require("../helpers/licencesDB");
router.get("/", function (_req, res) {
    res.render("location-search", {
        headTitle: "Locations"
    });
});
router.post("/doGetLocations", function (req, res) {
    const locations = licencesDB.getLocations(req.body, req.session);
    res.json(locations);
});
router.post("/doCreate", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const locationID = licencesDB.createLocation(req.body, req.session);
    res.json({
        success: true,
        locationID: locationID,
        locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
    });
});
router.post("/doUpdate", function (req, res) {
    if (req.session.user.userProperties.canCreate !== "true") {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const changeCount = licencesDB.updateLocation(req.body, req.session);
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
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const changeCount = licencesDB.deleteLocation(req.body.locationID, req.session);
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
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const changeCount = licencesDB.restoreLocation(req.body.locationID, req.session);
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
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const targetLocationID = req.body.targetLocationID;
    const sourceLocationID = req.body.sourceLocationID;
    const success = licencesDB.mergeLocations(targetLocationID, sourceLocationID, req.session);
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
            locationCity: configFns.getProperty("defaults.city"),
            locationProvince: configFns.getProperty("defaults.province")
        },
        currentDateInteger: dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns,
        isCreate: true
    });
});
router.get("/:locationID", function (req, res) {
    const locationID = parseInt(req.params.locationID);
    const location = licencesDB.getLocation(locationID, req.session);
    if (!location) {
        res.redirect("/locations/?error=locationNotFound");
        return;
    }
    const licences = licencesDB.getLicences({
        locationID: locationID
    }, true, false, req.session);
    res.render("location-view", {
        headTitle: location.locationDisplayName,
        location: location,
        licences: licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns
    });
});
router.get("/:locationID/edit", function (req, res) {
    const locationID = parseInt(req.params.locationID);
    if (req.session.user.userProperties.canCreate !== "true") {
        res.redirect("/locations/" + locationID + "/?error=accessDenied-noCreate");
        return;
    }
    const location = licencesDB.getLocation(locationID, req.session);
    if (!location) {
        res.redirect("/locations/?error=locationNotFound");
        return;
    }
    if (!location.canUpdate) {
        res.redirect("/locations/" + locationID + "/?error=accessDenied-noUpdate");
        return;
    }
    const licences = licencesDB.getLicences({
        locationID: locationID
    }, true, false, req.session) || [];
    res.render("location-edit", {
        headTitle: location.locationDisplayName,
        location: location,
        licences: licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date()),
        stringFns: stringFns,
        isCreate: false
    });
});
module.exports = router;
