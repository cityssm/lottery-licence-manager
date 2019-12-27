/* global require, module */


const express = require("express");
const router = express.Router();

const configFns = require("../helpers/configFns");

const licencesDB = require("../helpers/licencesDB");


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

  res.json(licencesDB.getOrganizations(req.body, true, req.session));
});


router.get("/doGetAll", function(req, res) {
  "use strict";

  res.json(licencesDB.getOrganizations({}, false, req.session));
});


router.post("/doGetRemarks", function(req, res) {
  "use strict";

  const organizationID = req.body.organizationID;

  res.json(licencesDB.getOrganizationRemarks(organizationID, req.session));
});


router.post("/doGetRemark", function(req, res) {
  "use strict";

  const organizationID = req.body.organizationID;
  const remarkIndex = req.body.remarkIndex;

  res.json(licencesDB.getOrganizationRemark(organizationID, remarkIndex, req.session));
});


router.post("/doAddRemark", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json("not allowed");
    return;
  }

  const remarkIndex = licencesDB.addOrganizationRemark(req.body, req.session);

  res.json({
    success: true,
    message: "Remark added successfully.",
    remarkIndex: remarkIndex
  });
});


router.post("/doEditRemark", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json("not allowed");
    return;
  }

  const changeCount = licencesDB.updateOrganizationRemark(req.body, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Remark updated successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Remark could not be updated."
    });
  }
});




router.get("/new", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.redirect("/organizations/?error=accessDenied");
    return;
  }

  res.render("organization-edit", {
    headTitle: "Organization Create",
    isCreate: true,
    organization: {
      organizationCity: configFns.getProperty("defaults.city"),
      organizationProvince: configFns.getProperty("defaults.province")
    }
  });
});


router.post("/doSave", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json("not allowed");
    return;
  }

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
        message: "Organization updated successfully."
      });
    } else {
      res.json({
        success: false,
        message: "Record Not Saved"
      });
    }

  }
});


router.post("/doDelete", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
    res.json("not allowed");
    return;
  }

  const changeCount = licencesDB.deleteOrganization(req.body.organizationID, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Organization deleted successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Organization could not be deleted."
    });
  }
});


router.post("/doRestore", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canUpdate !== "true") {
    res.json("not allowed");
    return;
  }

  const changeCount = licencesDB.restoreOrganization(req.body.organizationID, req.session);

  if (changeCount) {
    res.json({
      success: true,
      message: "Organization restored successfully."
    });
  } else {
    res.json({
      success: false,
      message: "Organization could not be restored."
    });
  }
});


/*
 * VIEW
 */


router.get("/:organizationID", function(req, res) {
  "use strict";

  const organizationID = req.params.organizationID;

  const organization = licencesDB.getOrganization(organizationID, req.session);

  if (!organization) {
    res.redirect("/organizations/?error=organizationNotFound");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  const licences = licencesDB.getLicences({
    organizationID: organizationID
  }, false, false, req.session) || [];

  const remarks = licencesDB.getOrganizationRemarks(organizationID, req.session) || [];

  res.render("organization-view", {
    headTitle: organization.organizationName,
    organization: organization,
    licences: licences,
    remarks: remarks,
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

  if (req.session.user.userProperties.canCreate !== "true") {
    res.redirect("/organizations/" + organizationID + "/?error=accessDenied-noCreate");
    return;
  }

  const organization = licencesDB.getOrganization(organizationID, req.session);

  if (!organization) {
    res.redirect("/organizations/?error=organizationNotFound");
    return;
  }

  if (!organization.canUpdate) {
    res.redirect("/organizations/" + organizationID + "/?error=accessDenied-noUpdate");
    return;
  }

  const dateTimeFns = require("../helpers/dateTimeFns");
  const stringFns = require("../helpers/stringFns");

  const licences = licencesDB.getLicences({
    organizationID: organizationID
  }, false, false, req.session) || [];

  const remarks = licencesDB.getOrganizationRemarks(organizationID, req.session) || [];

  res.render("organization-edit", {
    headTitle: "Organization Update",
    isCreate: false,
    organization: organization,
    licences: licences,
    remarks: remarks,
    currentDateInteger: dateTimeFns.dateToInteger(new Date()),
    stringFns: stringFns
  });
});


router.post("/:organizationID/doAddOrganizationRepresentative", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.canCreate !== "true") {
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

  if (req.session.user.userProperties.canCreate !== "true") {
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

  if (req.session.user.userProperties.canCreate !== "true") {
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

  if (req.session.user.userProperties.canCreate !== "true") {
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
