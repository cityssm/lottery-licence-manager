import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";
import * as licencesDB from "../../helpers/licencesDB.js";
import * as reportFns from "../../helpers/reportFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns.js";

import reportDefinitions from "../../data/reportDefinitions.js";

import type * as configTypes from "../../types/configTypes";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res) => {

  const reportName = req.params.reportName;

  let sql = "";
  let params = [];
  const functions = new Map<string, (...params: any) => any>();

  if (reportDefinitions[reportName]) {

    const def = reportDefinitions[reportName];
    sql = def.sql;

  } else {

    switch (reportName) {

      /*
       * Locations
       */

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

      /*
       * Organization Representatives
       */

      case "representatives-byOrganization":

        sql = "select r.organizationID, o.organizationName," +
          " representativeName, representativeTitle," +
          " representativeAddress1, representativeAddress2, representativeCity, representativeProvince," +
          " representativePostalCode, representativePhoneNumber, representativePhoneNumber2, representativeEmailAddress," +
          " isDefault" +
          " from OrganizationRepresentatives r" +
          " left join Organizations o on r.organizationID = o.organizationID" +
          " where r.organizationID = ?";

        params = [req.query.organizationID];

        break;

      /*
       * Organization Remarks
       */

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

      /*
       * Organization Remarks
       */

      case "reminders-byOrganization":

        sql = reportFns.getOrganizationRemindersQuery(true);

        params = [req.query.organizationID];

        break;

      /*
       * Organization Bank Records
       */

      case "bankRecordsFlat-byOrganization":

        sql = reportFns.getOrganizationBankRecordsFlatQuery(true);

        params = [req.query.organizationID];

        break;

      /*
       * Lottery Licences
       */

      case "licences-formatted":

        functions.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);

        sql = "select" +
          " l.licenceID, l.externalLicenceNumber," +
          " o.organizationID, o.organizationName," +
          " l.applicationDate," +
          " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
          " l.startDate, l.endDate, l.startTime, l.endTime," +
          " lo.locationName, lo.locationAddress1," +
          " l.municipality, l.licenceDetails, l.termsConditions," +
          " l.totalPrizeValue, l.licenceFee, l.issueDate," +
          " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
          " from LotteryLicences l" +
          " left join Locations lo on l.locationID = lo.locationID" +
          " left join Organizations o on l.organizationID = o.organizationID" +
          " where l.recordDelete_timeMillis is null";

        break;

      case "licences-byOrganization":

        functions.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);

        sql = "select" +
          " l.licenceID, l.externalLicenceNumber," +
          " o.organizationID, o.organizationName," +
          " l.applicationDate," +
          " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
          " l.startDate, l.endDate, l.startTime, l.endTime," +
          " lo.locationName, lo.locationAddress1," +
          " l.municipality, l.licenceDetails, l.termsConditions," +
          " l.totalPrizeValue, l.licenceFee, l.issueDate," +
          " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
          " from LotteryLicences l" +
          " left join Locations lo on l.locationID = lo.locationID" +
          " left join Organizations o on l.organizationID = o.organizationID" +
          " where l.recordDelete_timeMillis is null" +
          " and l.organizationID = ?";

        params = [req.query.organizationID];

        break;

      case "licences-byLocation":

        functions.set("userFn_licenceTypeKeyToLicenceType", reportFns.userFn_licenceTypeKeyToLicenceType);

        sql = "select" +
          " l.licenceID, l.externalLicenceNumber," +
          " o.organizationID, o.organizationName," +
          " l.applicationDate," +
          " userFn_licenceTypeKeyToLicenceType(l.licenceTypeKey) as licenceType," +
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

      /*
       * Lottery Licence Ticket Types
       */

      case "ticketTypes-byLicence":

        functions.set("userFn_ticketTypeField", (licenceTypeKey: string,
          ticketTypeKey: string,
          fieldName: "ticketPrice" | "ticketCount" | "prizesPerDeal" | "feePerUnit") => {

          const licenceType = configFns.getLicenceType(licenceTypeKey);

          if (!licenceType) {
            return null;
          }

          const ticketType: configTypes.ConfigTicketType = (licenceType.ticketTypes || []).find((ele) => ele.ticketType === ticketTypeKey);

          if (!ticketType) {
            return null;
          }

          return ticketType[fieldName];
        });

        sql = "select t.licenceID, t.ticketTypeIndex," +
          " t.amendmentDate, t.ticketType," +
          " t.unitCount," +
          " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketPrice') * userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'ticketCount') as valuePerDeal," +
          " userFn_ticketTypeField(l.licenceTypeKey, t.ticketType, 'prizesPerDeal') as prizesPerDeal," +
          " t.licenceFee," +

          " t.distributorLocationID," +
          " d.locationName as distributorLocationName," +
          " d.locationAddress1 as distributorAddress1," +

          " t.manufacturerLocationID," +
          " m.locationName as manufacturerLocationName," +
          " m.locationAddress1 as manufacturerLocationAddress1," +

          " t.recordCreate_userName, t.recordCreate_timeMillis, t.recordUpdate_userName, t.recordUpdate_timeMillis" +

          " from LotteryLicenceTicketTypes t" +
          " left join LotteryLicences l on t.licenceID = l.licenceID" +
          " left join Locations d on distributorLocationID = d.locationID" +
          " left join Locations m on manufacturerLocationID = m.locationID" +
          " where t.recordDelete_timeMillis is null" +
          " and t.licenceID = ?";

        params = [req.query.licenceID];

        break;

      /*
       * Lottery Licence Amendments
       */

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

      /*
       * Lottery Licence Transactions
       */

      case "transactions-byTransactionDate":

        sql = "select licenceID, transactionIndex," +
          " transactionDate, transactionTime," +
          " externalReceiptNumber, transactionAmount, transactionNote" +
          " from LotteryLicenceTransactions" +
          " where transactionDate = ?" +
          " and recordDelete_timeMillis is null";


        params = [(req.query.transactionDate as string).replace(/-/g, "")];

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

      /*
       * Lottery Events
       */

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
  }

  if (sql === "") {

    res.redirect(urlPrefix + "/reports/?error=reportNotFound");
    return;
  }

  const rowsColumnsObj = licencesDB.getRawRowsColumns(sql, params, functions);

  const csv = rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition",
    "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");

  res.setHeader("Content-Type", "text/csv");

  res.send(csv);
};


export default handler;
