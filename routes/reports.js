"use strict";
const express_1 = require("express");
const router = express_1.Router();
const licencesDB = require("../helpers/licencesDB");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const stringFns_1 = require("@cityssm/expressjs-server-js/stringFns");
router.get("/", (_req, res) => {
    const rightNow = new Date();
    res.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", (req, res) => {
    const reportName = req.params.reportName;
    let sql = "";
    let params = [];
    switch (reportName) {
        case "locations-all":
            sql = "select * from Locations";
            break;
        case "locations-unused": {
            sql = "select lo.locationID, lo.locationName," +
                " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
                " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +
                " from Locations lo" +
                (" left join (" +
                    "select locationID, max(endDate) as licences_endDateMax" +
                    " from LotteryLicences" +
                    " where recordDelete_timeMillis is null" +
                    " group by locationID" +
                    ") l on lo.locationID = l.locationID") +
                (" left join (" +
                    "select t.distributorLocationID," +
                    " max(l.endDate) as distributor_endDateMax" +
                    " from LotteryLicenceTicketTypes t" +
                    " left join LotteryLicences l on t.licenceID = l.licenceID" +
                    " where t.recordDelete_timeMillis is null" +
                    " group by t.distributorLocationID" +
                    ") d on lo.locationID = d.distributorLocationID") +
                (" left join (" +
                    "select t.manufacturerLocationID, max(l.endDate) as manufacturer_endDateMax" +
                    " from LotteryLicenceTicketTypes t" +
                    " left join LotteryLicences l on t.licenceID = l.licenceID" +
                    " where t.recordDelete_timeMillis is null" +
                    " group by t.manufacturerLocationID" +
                    ") m on lo.locationID = m.manufacturerLocationID") +
                " where lo.recordDelete_timeMillis is null" +
                " group by lo.locationID, lo.locationName," +
                " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
                " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +
                (" having max(" +
                    "ifnull(l.licences_endDateMax, 0)," +
                    " ifnull(d.distributor_endDateMax, 0)," +
                    " ifnull(m.manufacturer_endDateMax, 0)) <= ?");
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
            params.push(dateTimeFns.dateToInteger(threeYearsAgo));
            break;
        }
        case "organizations-all":
            sql = "select * from Organizations";
            break;
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
                " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
                " o.isEligibleForLicences, o.organizationNote," +
                " o.recordDelete_userName, o.recordDelete_timeMillis" +
                " from Organizations o" +
                " where o.recordDelete_timeMillis is not null";
            break;
        case "representatives-all":
            sql = "select * from OrganizationRepresentatives";
            break;
        case "representatives-byOrganization":
            sql = "select organizationID, representativeIndex," +
                " representativeName, representativeTitle," +
                " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
                " representativePostalCode, representativePhoneNumber, representativeEmailAddress," +
                " isDefault" +
                " from OrganizationRepresentatives" +
                " where organizationID = ?";
            params = [req.query.organizationID];
            break;
        case "remarks-all":
            sql = "select * from OrganizationRemarks";
            break;
        case "remarks-byOrganization":
            sql = "select organizationID, remarkIndex," +
                " remarkDate, remarkTime," +
                " remark, isImportant," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
                " from OrganizationRemarks" +
                " where recordDelete_timeMillis is null" +
                " and organizationID = ?";
            params = [req.query.organizationID];
            break;
        case "bankRecords-all":
            sql = "select * from OrganizationBankRecords";
            break;
        case "bankRecords-byOrganization":
            sql = "select organizationID, recordIndex, accountNumber, bankingYear, bankingMonth," +
                " bankRecordType, recordIsNA, recordDate, recordNote," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
                " from OrganizationBankRecords" +
                " where recordDelete_timeMillis is null" +
                " and organizationID = ?";
            params = [req.query.organizationID];
            break;
        case "licences-all":
            sql = "select * from LotteryLicences";
            break;
        case "licences-byOrganization":
            sql = "select" +
                " l.licenceID, l.externalLicenceNumber," +
                " o.organizationID, o.organizationName," +
                " l.applicationDate, l.licenceTypeKey," +
                " l.startDate, l.endDate, l.startTime, l.endTime," +
                " lo.locationName, lo.locationAddress1," +
                " l.municipality, l.licenceDetails, l.termsConditions," +
                " l.totalPrizeValue, l.licenceFee," +
                " l.issueDate," +
                " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
                " from LotteryLicences l" +
                " left join Locations lo on l.locationID = lo.locationID" +
                " left join Organizations o on l.organizationID = o.organizationID" +
                " where l.recordDelete_timeMillis is null" +
                " and l.organizationID = ?";
            params = [req.query.organizationID];
            break;
        case "licences-byLocation":
            sql = "select" +
                " l.licenceID, l.externalLicenceNumber," +
                " o.organizationID, o.organizationName," +
                " l.applicationDate, l.licenceTypeKey," +
                " l.startDate, l.endDate, l.startTime, l.endTime," +
                " lo.locationName, lo.locationAddress1," +
                " l.municipality, l.licenceDetails, l.termsConditions," +
                " l.totalPrizeValue, l.licenceFee, l.issueDate," +
                " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
                " from LotteryLicences l" +
                " left join Locations lo on l.locationID = lo.locationID" +
                " left join Organizations o on l.organizationID = o.organizationID" +
                " where l.recordDelete_timeMillis is null" +
                " and l.locationID = ?";
            params = [req.query.locationID];
            break;
        case "licences-notIssued":
            sql = "select l.licenceID, l.externalLicenceNumber, l.applicationDate," +
                " o.organizationID, o.organizationName," +
                " l.licenceTypeKey," +
                " l.startDate, l.endDate, l.startTime, l.endTime," +
                " lo.locationName, lo.locationAddress1," +
                " l.municipality," +
                " l.licenceDetails, l.termsConditions, l.totalPrizeValue," +
                " l.recordUpdate_userName, l.recordUpdate_timeMillis" +
                " from LotteryLicences l" +
                " left join Locations lo on l.locationID = lo.locationID" +
                " left join Organizations o on l.organizationID = o.organizationID" +
                " where l.recordDelete_timeMillis is null" +
                " and l.issueDate is null";
            break;
        case "ticketTypes-all":
            sql = "select * from LotteryLicenceTicketTypes";
            break;
        case "ticketTypes-byLicence":
            sql = "select t.licenceID, t.ticketType," +
                " t.unitCount, t.licenceFee," +
                " t.distributorLocationID," +
                " d.locationName as distributorLocationName," +
                " d.locationAddress1 as distributorAddress1," +
                " t.manufacturerLocationID," +
                " m.locationName as manufacturerLocationName," +
                " m.locationAddress1 as manufacturerLocationAddress1," +
                " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +
                " from LotteryLicenceTicketTypes t" +
                " left join Locations d on distributorLocationID = d.locationID" +
                " left join Locations m on manufacturerLocationID = m.locationID" +
                " where t.recordDelete_timeMillis is null" +
                " and t.licenceID = ?";
            params = [req.query.licenceID];
            break;
        case "amendments-all":
            sql = "select * from LotteryLicenceAmendments";
            break;
        case "amendments-byLicence":
            sql = "select licenceID, amendmentIndex, amendmentDate, amendmentTime," +
                " amendmentType, amendment," +
                " isHidden," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
                " from LotteryLicenceAmendments" +
                " where recordDelete_timeMillis is null" +
                " and licenceID = ?";
            params = [req.query.licenceID];
            break;
        case "transactions-all":
            sql = "select * from LotteryLicenceTransactions";
            break;
        case "transactions-byTransactionDate":
            sql = "select licenceID, transactionIndex," +
                " transactionDate, transactionTime," +
                " externalReceiptNumber, transactionAmount, transactionNote" +
                " from LotteryLicenceTransactions" +
                " where transactionDate = ?" +
                " and recordDelete_timeMillis is null";
            params = [req.query.transactionDate.replace(/-/g, "")];
            break;
        case "transactions-byLicence":
            sql = "select licenceID, transactionIndex," +
                " transactionDate, transactionTime," +
                " externalReceiptNumber, transactionAmount, transactionNote" +
                " from LotteryLicenceTransactions" +
                " where licenceID = ?" +
                " and recordDelete_timeMillis is null";
            params = [req.query.licenceID];
            break;
        case "events-all":
            sql = "select * from LotteryEvents";
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
            params = [dateTimeFns.dateToInteger(new Date())];
            break;
        case "events-pastUnreported":
            sql = "select e.licenceID, e.eventDate, e.reportDate," +
                " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
                " e.costs_receipts," +
                " l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
                " o.organizationID, o.organizationName," +
                " o.organizationAddress1, o.organizationAddress2," +
                " o.organizationCity, o.organizationProvince, o.organizationPostalCode," +
                " r.representativeName, r.representativeTitle, r.representativeAddress1, r.representativeAddress2," +
                " r.representativeCity, r.representativeProvince, r.representativePostalCode," +
                " r.representativePhoneNumber, r.representativeEmailAddress" +
                " from LotteryEvents e" +
                " left join LotteryLicences l on e.licenceID = l.licenceID" +
                " left join Organizations o on l.organizationID = o.organizationID" +
                " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
                " where e.recordDelete_timeMillis is null" +
                " and l.recordDelete_timeMillis is null" +
                " and e.eventDate < ?" +
                " and (e.reportDate is null or e.reportDate = 0)";
            params = [dateTimeFns.dateToInteger(new Date())];
            break;
        case "events-byLicence":
            sql = "select e.licenceID, l.externalLicenceNumber, e.eventDate," +
                " o.organizationName," +
                " l.startDate, l.endDate, l.startTime, l.endTime," +
                " lo.locationName, lo.locationAddress1, l.licenceDetails, l.licenceTypeKey," +
                " l.totalPrizeValue, l.licenceFee," +
                " e.bank_name, e.bank_address, e.bank_accountNumber, e.bank_accountBalance," +
                " e.costs_receipts, e.costs_admin, e.costs_prizesAwarded," +
                (" ifnull(e.costs_receipts, 0)" +
                    " - ifnull(e.costs_admin, 0)" +
                    " - ifnull(e.costs_prizesAwarded, 0) as costs_netProceeds,") +
                " e.costs_amountDonated" +
                " from LotteryEvents e" +
                " left join LotteryLicences l on e.licenceID = l.licenceID" +
                " left join Locations lo on l.locationID = lo.locationID" +
                " left join Organizations o on l.organizationID = o.organizationID" +
                " where e.recordDelete_timeMillis is null" +
                " and l.recordDelete_timeMillis is null" +
                " and e.licenceID = ?";
            params = [req.query.licenceID];
            break;
    }
    if (sql === "") {
        res.redirect("/reports/?error=reportNotFound");
        return;
    }
    const rowsColumnsObj = licencesDB.getRawRowsColumns(sql, params);
    const csv = stringFns_1.rawToCSV(rowsColumnsObj);
    res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now() + ".csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
});
module.exports = router;
