/* global require, module */


const express = require("express");
const router = express.Router();


/*
 * SEARCH
 */


router.get("/", function(req, res) {
  "use strict";
  res.render("organization-search");
});


router.post("/doSearch", function(req, res) {
  "use strict";

  const licencesDB = require("../helpers/licencesDB");

  res.json(licencesDB.getOrganizations(req.body));
});


router.get("/new", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.redirect("/organizations");
  }

  const config = require("../data/config");

  res.render("organization-edit", {
    isCreate: true,
    organization: {
      OrganizationCity: config.defaults.city || "",
      OrganizationProvince: config.defaults.province || ""
    }
  });
});


router.post("/doSave", function(req, res) {
  "use strict";

  const licencesDB = require("../helpers/licencesDB");

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

  const licencesDB = require("../helpers/licencesDB");

  const organization = licencesDB.getOrganization(organizationID);

  res.render("organization-view", {
    organization: organization
  });
});


/*
 * CREATE / EDIT
 */


 router.get("/:organizationID/edit", function(req, res) {
   "use strict";

   const organizationID = req.params.organizationID;

   if (req.session.user.userProperties.organizations_canEdit !== "true") {
     res.redirect("/organizations/" + organizationID);
   }

   const licencesDB = require("../helpers/licencesDB");

   const organization = licencesDB.getOrganization(organizationID);

   res.render("organization-edit", {
     isCreate: false,
     organization: organization
   });
 });



module.exports = router;
