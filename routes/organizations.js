/* global require, module */


const express = require("express");
const router = express.Router();


router.get("/", function(req, res) {
  "use strict";

  res.render("organization-search");
});


router.post("/doSearch", function(req, res) {
  "use strict";

  const licencesDB = require("better-sqlite3")("data/licences.db");

  let params = [];

  let sql = "select OrganizationID, OrganizationName" +
    " from Organizations" +
    " where RecordDelete_TimeMillis is null";

  if (req.body.organizationName && req.body.organizationName !== "") {
    sql += " and instr(OrganizationName, ?)";
    params.push(req.body.organizationName);
  }

  sql += " limit 100";

  let rows = licencesDB.prepare(sql).all(params);

  res.json(rows);
});


router.get("/new", function(req, res) {
  "use strict";

  if (req.session.user.userProperties.organizations_canEdit !== "true") {
    res.redirect("/organizations");
  }

  res.render("organization-edit", {
    isCreate: true,
    organization: {
      OrganizationCity: "Sault Ste. Marie",
      OrganizationProvince: "ON"
    }
  });
});


module.exports = router;
