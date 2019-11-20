/* global require, module */

const express = require("express");
const router = express.Router();

router.get("/", function(req, res) {
  "use strict";
  res.render("licence-search");
});

router.get(["/new", "/new/:organizationID"], function(req, res) {
  "use strict";

  if (req.session.user.userProperties.licences_canEdit !== "true") {
    res.redirect("/licences");
  }

  const organizationID = req.params.organizationID;

  let organization = {};

  if (organizationID && organizationID !== "") {
    const licencesDB = require("../helpers/licencesDB");
     organization = licencesDB.getOrganization(organizationID);
  }

  res.render("licence-edit", {
    isCreate: true,
    organization: organization
  });
});

module.exports = router;
