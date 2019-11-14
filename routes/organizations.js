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


router.post("/doSave", function(req, res) {
  "use strict";

  const licencesDB = require("better-sqlite3")("data/licences.db");
  const nowMillis = Date.now();

  if (req.body.organizationID === "") {

    const info = licencesDB
      .prepare("insert into Organizations (" +
        "OrganizationName, OrganizationAddress1, OrganizationAddress2," +
        " OrganizationCity, OrganizationProvince, OrganizationPostalCode," +
        " RecordCreate_UserName, RecordCreate_TimeMillis," +
        " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        req.body.organizationName,
        req.body.organizationAddress1,
        req.body.organizationAddress2,
        req.body.organizationCity,
        req.body.organizationProvince,
        req.body.organizationPostalCode,
        req.session.user.userName,
        nowMillis,
        req.session.user.userName,
        nowMillis
      );

    if (info.changes) {
      res.json({
        success: true,
        organizationID: info.lastInsertRowid
      });
    } else {
      res.json({
        success: false,
        message: "Error Saving"
      });
    }
  } else {

    const info = licencesDB
      .prepare("update Organizations" +
        " set OrganizationName = ?," +
        " OrganizationAddress1 = ?," +
        " OrganizationAddress2 = ?," +
        " OrganizationCity = ?," +
        " OrganizationProvince = ?," +
        " OrganizationPostalCode = ?," +
        " RecordUpdate_UserName = ?," +
        " RecordUpdate_TimeMillis = ?" +
        " where OrganizationID = ?" +
        " and RecordDelete_TimeMillis is null")
      .run(
        req.body.organizationName,
        req.body.organizationAddress1,
        req.body.organizationAddress2,
        req.body.organizationCity,
        req.body.organizationProvince,
        req.body.organizationPostalCode,
        req.session.user.userName,
        nowMillis,
        req.body.organizationID
      );

      if (info.changes) {

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


module.exports = router;
