/* global require, module */

const express = require("express");
const router = express.Router();

const licencesDB = require("../helpers/licencesDB");
const stringFns = require("../helpers/stringFns");


router.get("/", function(req, res) {
  "use strict";

  res.render("report-search", {
    headTitle: "Reports"
  });
});

router.all("/:reportName", function(req, res) {
  "use strict";

  const reportName = req.params.reportName;

  let sql = "";
  let params = [];

  switch (reportName) {

    case "organizations-withDefaultRepresentatives":

      sql = "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
        " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
        " r.representativeName, r.representativeTitle, r.representativeAddress1, r.representativeAddress2," +
        " r.representativeCity, r.representativeProvince, r.representativePostalCode," +
        " r.representativePhoneNumber," +
        " o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " from Organizations o" +
        " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
        " where o.recordDelete_timeMillis is null";

      break;

    case "organizations-deleted":

      sql = "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
        " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
        " o.recordDelete_userName, o.recordDelete_timeMillis" +
        " from Organizations o" +
        " where o.recordDelete_timeMillis is not null";

      break;

    case "licences-unpaid":

      sql = "select l.licenceID, l.externalLicenceNumber, l.applicationDate," +
        " o.organizationID, o.organizationName," +
        " l.licenceTypeKey," +
        " l.startDate, l.endDate, l.startTime, l.endTime, l.location, l.municipality," +
        " l.licenceDetails, l.termsConditions, l.totalPrizeValue," +
        " l.recordUpdate_userName, l.recordUpdate_timeMillis" +
        " from LotteryLicences l" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " where l.recordDelete_timeMillis is null" +
        " and l.licenceFeeIsPaid = 0";
  }

  if (sql === "") {
    res.redirect("/reports/?error=reportNotFound");
    return;
  }

  const rowsColumnsObj = licencesDB.getRawRowsColumns(sql, params);

  const csv = stringFns.rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now() + ".csv");
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
});

module.exports = router;
