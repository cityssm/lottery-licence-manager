import { Router } from "express";

import * as configFns from "../helpers/configFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as licencesDB from "../helpers/licencesDB";
import * as licencesDBLocations from "../helpers/licencesDB-locations";

import { userCanCreate, userCanUpdate, userIsAdmin, forbiddenJSON } from "../helpers/userFns";

const router = Router();


router.get("/", (_req, res) => {

  res.render("location-search", {
    headTitle: "Locations"
  });

});


router.post("/doGetLocations", (req, res) => {

  const locations = licencesDBLocations.getLocations(req.session, {
    limit: req.body.limit || -1,
    offset: req.body.offset || 0,
    locationNameAddress: req.body.locationNameAddress,
    locationIsDistributor: ("locationIsDistributor" in req.body && req.body.locationIsDistributor !== ""
      ? parseInt(req.body.locationIsDistributor, 10)
      : -1),
    locationIsManufacturer: ("locationIsManufacturer" in req.body && req.body.locationIsManufacturer !== ""
      ? parseInt(req.body.locationIsManufacturer, 10)
      : -1),
    locationIsActive: req.body.locationIsActive || ""
  });

  res.json(locations);

});


// Cleanup


router.get("/cleanup", (req, res) => {

  if (!userCanUpdate(req)) {

    res.redirect("/locations/?error=accessDenied");
    return;
  }

  res.render("location-cleanup", {
    headTitle: "Location Cleanup"
  });
});

router.post("/doGetInactive", (req, res) => {

  const inactiveYears = parseInt(req.body.inactiveYears, 10);

  res.json(licencesDBLocations.getInactiveLocations(inactiveYears));

});


router.post("/doCreate", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const locationID = licencesDBLocations.createLocation(req.body, req.session);

  return res.json({
    success: true,
    locationID,
    locationDisplayName: (req.body.locationName === "" ? req.body.locationAddress1 : req.body.locationName)
  });

});


router.post("/doUpdate", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = licencesDBLocations.updateLocation(req.body, req.session);

  if (changeCount) {

    return res.json({
      success: true,
      message: "Location updated successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Record Not Saved"
    });

  }

});


router.post("/doDelete", (req, res) => {

  if (!userCanCreate(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = licencesDBLocations.deleteLocation(req.body.locationID, req.session);

  if (changeCount) {

    return res.json({
      success: true,
      message: "Location deleted successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Location could not be deleted."
    });

  }

});


router.post("/doRestore", (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const changeCount = licencesDBLocations.restoreLocation(req.body.locationID, req.session);

  if (changeCount) {

    return res.json({
      success: true,
      message: "Location restored successfully."
    });

  } else {

    return res.json({
      success: false,
      message: "Location could not be restored."
    });

  }

});


router.post("/doMerge", (req, res) => {

  if (!userIsAdmin(req)) {
    return forbiddenJSON(res);
  }

  const targetLocationID = req.body.targetLocationID;
  const sourceLocationID = req.body.sourceLocationID;

  const success = licencesDBLocations.mergeLocations(targetLocationID, sourceLocationID, req.session);

  res.json({
    success
  });

});


router.get("/new", (req, res) => {

  if (!userCanCreate(req)) {

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
    isCreate: true
  });

});


router.get("/:locationID", (req, res) => {

  const locationID = parseInt(req.params.locationID, 10);

  const location = licencesDBLocations.getLocation(locationID, req.session);

  if (!location) {

    res.redirect("/locations/?error=locationNotFound");
    return;

  }

  const licences = licencesDB.getLicences({
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

});


router.get("/:locationID/edit", (req, res) => {

  const locationID = parseInt(req.params.locationID, 10);

  if (!userCanCreate(req)) {

    res.redirect("/locations/" + locationID.toString() + "/?error=accessDenied-noCreate");
    return;

  }

  const location = licencesDBLocations.getLocation(locationID, req.session);

  if (!location) {

    res.redirect("/locations/?error=locationNotFound");
    return;

  }

  if (!location.canUpdate) {

    res.redirect("/locations/" + locationID.toString() + "/?error=accessDenied-noUpdate");
    return;

  }

  const licences = licencesDB.getLicences({
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

});


export = router;
