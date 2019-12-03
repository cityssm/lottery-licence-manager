/* global require, module */


const express = require("express");
const router = express.Router();

const licencesDB = require("../helpers/licencesDB");
const configFns = require("../helpers/configFns");


/*
 * SEARCH
 */


router.get("/", function(req, res) {
  "use strict";
  res.render("organization-search", {
    headTitle: "Organizations"
  });
});


router.post("/doSearch", function(req, res) {
  "use strict";

  res.json(licencesDB.getOrganizations(req.body, true));
});


router.get("/doGetAll", function(req, res) {
  "use strict";

  res.json(licencesDB.getOrganizations({}, false));
});


router.get("/new", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.redirect("/organizations/?error=accessDenied");
    return;
  }

  res.render("organization-edit", {
    headTitle: "Organization Create",
    isCreate: true,
    organization: {
      OrganizationCity: configFns.getProperty("defaults.city"),
      OrganizationProvince: configFns.getProperty("defaults.province")
    }
  });
});


router.post("/doSave", function(req, res) {
  "use strict";

  if (req.body.organizationID === "") {

    const newOrganizationID = licencesDB.createOrganization(req.body, req.session);

    res.json({
      success: true,
      organizationID: newOrganizationID
    });

  } else {

    const changeCount = licencesDB.updateOrganization(req.body, req.session);

    if (changeCount) {
      res.json({
        success: true,
        message: "Organization Updated"
      });
    } else {
      res.json({
        success: false,
        message: "Record Not Saved"
      });
    }

  }
});


/*
 * VIEW
 */


router.get("/:organizationID", function(req, res) {
  "use strict";

  const organizationID = req.params.organizationID;

  const organization = licencesDB.getOrganization(organizationID);

  if (!organization) {
    res.redirect("/organizations/?error=organizationNotFound");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  const licences = licencesDB.getLicences({
    organizationID: organizationID
  }, false, false);

  res.render("organization-view", {
    headTitle: organization.OrganizationName,
    organization: organization,
    licences: licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    stringFns: stringFns
  });
});


/*
 * CREATE / EDIT
 */


router.get("/:organizationID/edit", function(req, res) {
  "use strict";

  const organizationID = req.params.organizationID;

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.redirect("/organizations/" + organizationID + "/?error=accessDenied");
    return;
  }

  const organization = licencesDB.getOrganization(organizationID);

  if (!organization) {
    res.redirect("/organizations/?error=organizationNotFound");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  const licences = licencesDB.getLicences({
    organizationID: organizationID
  }, false, false) || [];

  res.render("organization-edit", {
    headTitle: "Organization Update",
    isCreate: false,
    organization: organization,
    licences: licences,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    stringFns: stringFns
  });
});


router.post("/:organizationID/doAddOrganizationRepresentative", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.json("not allowed");
    return;
  }

  const organizationID = req.params.organizationID;

  const representativeObj = licencesDB.addOrganizationRepresentative(organizationID, req.body);

  if (representativeObj) {
    res.json({
      success: true,
      organizationRepresentative: representativeObj
    });
  } else {
    res.json({
      success: false
    });
  }
});


router.post("/:organizationID/doEditOrganizationRepresentative", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.json("not allowed");
    return;
  }

  const organizationID = req.params.organizationID;

  const representativeObj = licencesDB.updateOrganizationRepresentative(organizationID, req.body);

  if (representativeObj) {
    res.json({
      success: true,
      organizationRepresentative: representativeObj
    });
  } else {
    res.json({
      success: false
    });
  }
});


router.post("/:organizationID/doDeleteOrganizationRepresentative", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.json("not allowed");
    return;
  }

  const organizationID = req.params.organizationID;
  const representativeIndex = req.body.representativeIndex;

  const success = licencesDB.deleteOrganizationRepresentative(organizationID, representativeIndex);

  res.json({
    success: success
  });
});


router.post("/:organizationID/doSetDefaultRepresentative", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.json("not allowed");
    return;
  }

  const organizationID = req.params.organizationID;
  const isDefaultRepresentativeIndex = req.body.isDefaultRepresentativeIndex;

  const success = licencesDB.setDefaultOrganizationRepresentative(organizationID, isDefaultRepresentativeIndex);

  res.json({
    success: success
  });
});



module.exports = router;
