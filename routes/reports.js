/* global require, module */

const express = require("express");
const router = express.Router();

const licencesDB = require("../helpers/licencesDB");
const stringFns = require("../helpers/stringFns");
const dateTimeFns = require("../helpers/dateTimeFns");


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
        " r.representativePhoneNumber, r.representativeEmailAddress," +
        " o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " from Organizations o" +
        " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
        " where o.recordDelete_timeMillis is null" +
        " and o.isEligibleForLicences = 1";

      break;

    case "organizations-ineligible":

      sql = "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
        " o.organizationCity, o.organizationProvince, o.organizationPostalCode, o.organizationNote," +
        " o.recordDelete_userName, o.recordDelete_timeMillis" +
        " from Organizations o" +
        " where o.recordDelete_timeMillis is null" +
        " and o.isEligibleForLicences = 0";

      break;

    case "organizations-deleted":

      sql = "select o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2," +
        " o.organizationCity, o.organizationProvince, o.organizationPostalCode, o.isEligibleForLicences, o.organizationNote," +
        " o.recordDelete_userName, o.recordDelete_timeMillis" +
        " from Organizations o" +
        " where o.recordDelete_timeMillis is not null";

      break;

    case "organizationRepresentatives-byOrganization":

      sql = "select organizationID, representativeIndex," +
        " representativeName, representativeTitle," +
        " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
        " representativePostalCode, representativePhoneNumber, representativeEmailAddress," +
        " isDefault" +
        " from OrganizationRepresentatives" +
        " where organizationID = ?";

      params = [
        req.query.organizationID
      ];

      break;

    case "licences-byOrganization":

      sql = "select organizationID, licenceID, externalLicenceNumber," +
        " applicationDate, licenceTypeKey," +
        " startDate, endDate, startTime, endTime," +
        " location, municipality, licenceDetails, termsConditions," +
        " totalPrizeValue, licenceFee, externalReceiptNumber, licenceFeeIsPaid," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from LotteryLicences" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?";

      params = [
        req.query.organizationID
      ];

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

      break;

    case "events-upcoming":

      sql = "select e.licenceID," +
        " e.eventDate, l.startTime, l.endTime," +
        " l.externalLicenceNumber, o.organizationName," +
        " l.licenceTypeKey, l.licenceDetails" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " where e.recordDelete_timeMillis is NULL" +
        " and l.recordDelete_timeMillis is NULL" +
        " and e.eventDate >= ?";

      params = [
        dateTimeFns.dateToInteger(new Date())
      ];

      break;

    case "events-pastUnreported":

      sql = "select e.licenceID, e.eventDate," +
        " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
        " e.costs_receipts," +
        " l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
        " o.organizationID, o.organizationName, o.organizationAddress1, o.organizationAddress2, o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
        " r.representativeName, r.representativeTitle, r.representativeAddress1, r.representativeAddress2, r.representativeCity, r.representativeProvince, r.representativePostalCode," +
        " r.representativePhoneNumber, r.representativeEmailAddress" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
        " left join Organizations o on l.organizationID = o.organizationID" +
        " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
        " where e.recordDelete_timeMillis is null" +
        " and l.recordDelete_timeMillis is null" +
        " and e.eventDate < ?" +
        " and (e.bank_name is null or e.bank_name = '' or e.costs_receipts is null or e.costs_receipts = 0)";

      params = [
        dateTimeFns.dateToInteger(new Date())
      ];

      break;
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
