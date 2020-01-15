/* global require, module */


const configFns = require("./configFns");

const dateTimeFns = require("./dateTimeFns");

const sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";



const licencesDB = (function() {
  "use strict";

  function getApplicationSetting(db, settingKey) {

    const row = db.prepare("select settingValue" +
        " from ApplicationSettings" +
        " where SettingKey = ?")
      .get(settingKey);

    if (row) {
      return row.settingValue || "";
    } else {
      return "";
    }
  }


  function canUpdateObject(objType, obj, reqSession) {

    // check user permissions

    let canUpdate = false;

    if (!reqSession) {
      canUpdate = false;

    } else if (obj.recordDelete_timeMillis) {
      // deleted records cannot be updated
      canUpdate = false;

    } else if (reqSession.user.userProperties.canUpdate === "true") {
      canUpdate = true;

    } else if (reqSession.user.userProperties.canCreate === "true" &&
      (obj.recordCreate_userName === reqSession.user.userName || obj.recordUpdate_userName === reqSession.user.userName) &&
      obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {

      // users with only create permission can update their own records within the time window

      canUpdate = true;
    }

    // if recently updated, send back permission

    if (obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {
      return canUpdate;
    }

    // check if object should be locked

    if (canUpdate) {

      const currentDateInteger = dateTimeFns.dateToInteger(new Date());

      switch (objType) {

        case "licence":

          if (obj.endDate < currentDateInteger) {
            canUpdate = false;
          }
          break;

        case "event":

          if (obj.bank_name !== "" && obj.costs_receipts) {
            canUpdate = false;
          }
          break;
      }
    }

    return canUpdate;
  }


  function getLicence(licenceID, reqSession, db) {

    const licenceObj = db.prepare("select l.*," +
        " lo.locationName, lo.locationAddress1" +
        " from LotteryLicences l" +
        " left join Locations lo on l.locationID = lo.locationID" +
        " where l.recordDelete_timeMillis is null" +
        " and l.licenceID = ?")
      .get(licenceID);

    if (licenceObj) {

      licenceObj.applicationDateString = dateTimeFns.dateIntegerToString(licenceObj.applicationDate || 0);

      licenceObj.startDateString = dateTimeFns.dateIntegerToString(licenceObj.startDate || 0);
      licenceObj.endDateString = dateTimeFns.dateIntegerToString(licenceObj.endDate || 0);

      licenceObj.startTimeString = dateTimeFns.timeIntegerToString(licenceObj.startTime || 0);
      licenceObj.endTimeString = dateTimeFns.timeIntegerToString(licenceObj.endTime || 0);

      licenceObj.locationDisplayName = (licenceObj.locationName === "" ? licenceObj.locationAddress1 : licenceObj.locationName);

      licenceObj.canUpdate = canUpdateObject("licence", licenceObj, reqSession);

      // ticket types

      const ticketTypesList = db.prepare("select t.ticketType," +
          " t.distributorLocationID, d.locationName as distributorLocationName, d.locationAddress1 as distributorLocationAddress1," +
          " t.manufacturerLocationID, m.locationName as manufacturerLocationName, m.locationAddress1 as manufacturerLocationAddress1," +
          " t.unitCount, t.licenceFee" +
          " from LotteryLicenceTicketTypes t" +
          " left join Locations d on t.distributorLocationID = d.locationID" +
          " left join Locations m on t.manufacturerLocationID = m.locationID" +
          " where t.recordDelete_timeMillis is null" +
          " and t.licenceID = ?" +
          " order by t.ticketType")
        .all(licenceID);

      for (let ticketTypeIndex = 0; ticketTypeIndex < ticketTypesList.length; ticketTypeIndex += 1) {

        const ticketTypeObj = ticketTypesList[ticketTypeIndex];

        ticketTypeObj.distributorLocationDisplayName = ticketTypeObj.distributorLocationName === "" ?
          ticketTypeObj.distributorLocationAddress1 :
          ticketTypeObj.distributorLocationName;

        ticketTypeObj.manufacturerLocationDisplayName = ticketTypeObj.manufacturerLocationName === "" ?
          ticketTypeObj.manufacturerLocationAddress1 :
          ticketTypeObj.manufacturerLocationName;
      }

      licenceObj.licenceTicketTypes = ticketTypesList;

      // fields

      const fieldList = db.prepare("select * from LotteryLicenceFields" +
          " where licenceID = ?")
        .all(licenceID);

      licenceObj.licenceFields = fieldList;

      // events

      const eventList = db.prepare("select eventDate from LotteryEvents" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null" +
          " order by eventDate")
        .all(licenceID);

      for (let eventIndex = 0; eventIndex < eventList.length; eventIndex += 1) {
        const eventObj = eventList[eventIndex];
        eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);
      }

      licenceObj.events = eventList;

      // amendments

      const amendments = db.prepare("select *" +
          " from LotteryLicenceAmendments" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null" +
          " order by amendmentDate, amendmentTime, amendmentIndex")
        .all(licenceID);

      for (let amendmentIndex = 0; amendmentIndex < amendments.length; amendmentIndex += 1) {
        const amendmentObj = amendments[amendmentIndex];
        amendmentObj.amendmentDateString = dateTimeFns.dateIntegerToString(amendmentObj.amendmentDate);
        amendmentObj.amendmentTimeString = dateTimeFns.timeIntegerToString(amendmentObj.amendmentTime);
      }

      licenceObj.licenceAmendments = amendments;
    }

    return licenceObj;
  }


  return {

    getRawRowsColumns: function(sql, params) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const stmt = db.prepare(sql);

      stmt.raw(true);

      const rows = stmt.all(params);
      const columns = stmt.columns();

      stmt.raw(false);

      db.close();

      return {
        rows: rows,
        columns: columns
      };
    },

    /*
     * LOCATIONS
     */

    getLocations: function(reqBody_or_paramsObj, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      if (!reqBody_or_paramsObj) {
        reqBody_or_paramsObj = {};
      }

      let params = [];

      let sql = "select lo.locationID, lo.locationName," +
        " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
        " lo.locationIsDistributor, lo.locationIsManufacturer," +
        " l.licences_endDateMax, coalesce(l.licences_count, 0) as licences_count," +
        " d.distributor_endDateMax, coalesce(d.distributor_count, 0) as distributor_count," +
        " m.manufacturer_endDateMax, coalesce(m.manufacturer_count, 0) as manufacturer_count" +
        " from Locations lo" +

        (" left join (" +
          "select locationID," +
          " count(licenceID) as licences_count, max(endDate) as licences_endDateMax" +
          " from LotteryLicences" +
          " where recordDelete_timeMillis is null" +
          " group by locationID" +
          ") l on lo.locationID = l.locationID") +

        (" left join (" +
          "select t.distributorLocationID," +
          " count(*) as distributor_count, max(l.endDate) as distributor_endDateMax" +
          " from LotteryLicenceTicketTypes t" +
          " left join LotteryLicences l on t.licenceID = l.licenceID" +
          " where t.recordDelete_timeMillis is null" +
          " group by t.distributorLocationID" +
          ") d on lo.locationID = d.distributorLocationID") +

        (" left join (" +
          "select t.manufacturerLocationID," +
          " count(*) as manufacturer_count, max(l.endDate) as manufacturer_endDateMax" +
          " from LotteryLicenceTicketTypes t" +
          " left join LotteryLicences l on t.licenceID = l.licenceID" +
          " where t.recordDelete_timeMillis is null" +
          " group by t.manufacturerLocationID" +
          ") m on lo.locationID = m.manufacturerLocationID") +

        " where lo.recordDelete_timeMillis is null";

      if (reqBody_or_paramsObj.locationIsDistributor && reqBody_or_paramsObj.locationIsDistributor !== "") {
        sql += " and lo.locationIsDistributor = ?";
        params.push(reqBody_or_paramsObj.locationIsDistributor);
      }

      if (reqBody_or_paramsObj.locationIsManufacturer && reqBody_or_paramsObj.locationIsManufacturer !== "") {
        sql += " and lo.locationIsManufacturer = ?";
        params.push(reqBody_or_paramsObj.locationIsManufacturer);
      }

      sql += " group by lo.locationID, lo.locationName, lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince, lo.locationIsDistributor, lo.locationIsManufacturer" +
        " order by case when lo.locationName = '' then lo.locationAddress1 else lo.locationName end";

      const rows = db.prepare(sql).all(params);

      db.close();

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const locationObj = rows[rowIndex];
        locationObj.locationDisplayName = locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

        locationObj.licences_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.licences_endDateMax);
        locationObj.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.distributor_endDateMax);
        locationObj.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.manufacturer_endDateMax);

        locationObj.canUpdate = canUpdateObject("location", locationObj, reqSession);
      }

      return rows;
    },

    getLocation: function(locationID, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const locationObj = db.prepare("select * from Locations" +
          " where locationID = ?")
        .get(locationID);

      if (locationObj) {
        locationObj.canUpdate = canUpdateObject("location", locationObj, reqSession);
      }

      db.close();

      locationObj.locationDisplayName = locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;

      return locationObj;
    },

    createLocation: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("insert into Locations" +
          " (locationName, locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode," +
          " locationIsDistributor, locationIsManufacturer," +
          " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.locationName,
          reqBody.locationAddress1,
          reqBody.locationAddress2,
          reqBody.locationCity,
          reqBody.locationProvince,
          reqBody.locationPostalCode,
          reqBody.locationIsDistributor ? 1 : 0,
          reqBody.locationIsManufacturer ? 1 : 0,
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

      db.close();

      return info.lastInsertRowid;
    },

    updateLocation: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update Locations" +
          " set locationName = ?," +
          " locationAddress1 = ?," +
          " locationAddress2 = ?," +
          " locationCity = ?," +
          " locationProvince = ?," +
          " locationPostalCode = ?," +
          " locationIsDistributor = ?," +
          " locationIsManufacturer = ?," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where recordDelete_timeMillis is null" +
          " and locationID = ?")
        .run(reqBody.locationName,
          reqBody.locationAddress1,
          reqBody.locationAddress2,
          reqBody.locationCity,
          reqBody.locationProvince,
          reqBody.locationPostalCode,
          reqBody.locationIsDistributor ? 1 : 0,
          reqBody.locationIsManufacturer ? 1 : 0,
          reqSession.user.userName,
          nowMillis,
          reqBody.locationID
        );

      db.close();

      return info.changes;
    },

    deleteLocation: function(locationID, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update Locations" +
          " set recordDelete_userName = ?," +
          " recordDelete_timeMillis = ?" +
          " where recordDelete_timeMillis is null" +
          " and locationID = ?")
        .run(reqSession.user.userName,
          nowMillis,
          locationID
        );

      db.close();

      return info.changes;
    },

    mergeLocations: function(locationID_target, locationID_source, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      // get locationAttributes

      let locationAttributes = db.prepare("select max(locationIsDistributor) as locationIsDistributorMax," +
          " max(locationIsManufacturer) as locationIsManufacturerMax," +
          " count(locationID) as locationCount" +
          " from Locations" +
          " where recordDelete_timeMillis is null" +
          " and (locationID = ? or locationID = ?)")
        .get(locationID_target, locationID_source);

      if (!locationAttributes) {
        db.close();
        return false;
      }

      if (locationAttributes.locationCount !== 2) {
        db.close();
        return false;
      }

      // update the target location

      db.prepare("update Locations" +
          " set locationIsDistributor = ?," +
          " locationIsManufacturer = ?" +
          " where locationID = ?")
        .run(locationAttributes.locationIsDistributorMax,
          locationAttributes.locationIsManufacturerMax,
          locationID_target);

      // update records assigned to the source location

      db.prepare("update LotteryLicences" +
          " set locationID = ?" +
          " where locationID = ?" +
          " and recordDelete_timeMillis is null")
        .run(locationID_target, locationID_source);

      db.prepare("update LotteryLicenceTicketTypes" +
          " set distributorLocationID = ?" +
          " where distributorLocationID = ?" +
          " and recordDelete_timeMillis is null")
        .run(locationID_target, locationID_source);

      db.prepare("update LotteryLicenceTicketTypes" +
          " set manufacturerLocationID = ?" +
          " where manufacturerLocationID = ?" +
          " and recordDelete_timeMillis is null")
        .run(locationID_target, locationID_source);

      // set the source record to inactive

      db.prepare("update Locations" +
          " set recordDelete_userName = ?," +
          " recordDelete_timeMillis = ?" +
          " where locationID = ?")
        .run(reqSession.user.userName,
          nowMillis,
          locationID_source);

      db.close();

      return true;
    },

    /*
     * ORGANIZATIONS
     */

    getOrganizations: function(reqBody, useLimit, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      let params = [
        dateTimeFns.dateToInteger(new Date())
      ];

      let sql = "select o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
        " sum(case when l.endDate >= ? then 1 else 0 end) as licences_activeCount," +
        " max(l.endDate) as licences_endDateMax," +
        " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " from Organizations o" +
        " left join LotteryLicences l on o.organizationID = l.organizationID and l.recordDelete_timeMillis is null" +
        " where o.recordDelete_timeMillis is null";

      if (reqBody.organizationName && reqBody.organizationName !== "") {

        const organizationNamePieces = reqBody.organizationName.toLowerCase().split(" ");

        for (let pieceIndex = 0; pieceIndex < organizationNamePieces.length; pieceIndex += 1) {
          sql += " and instr(lower(o.organizationName), ?)";
          params.push(organizationNamePieces[pieceIndex]);
        }
      }

      if (reqBody.representativeName && reqBody.representativeName !== "") {
        sql += " and o.organizationID in (select organizationID from OrganizationRepresentatives where instr(lower(representativeName), ?))";
        params.push(reqBody.representativeName.toLowerCase());
      }

      if (reqBody.isEligibleForLicences && reqBody.isEligibleForLicences !== "") {
        sql += " and o.isEligibleForLicences = ?";
        params.push(reqBody.isEligibleForLicences);
      }

      sql += " group by o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
        " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " order by o.organizationName, o.organizationID";

      if (useLimit) {
        sql += " limit 100";
      }

      let rows = db.prepare(sql).all(params);

      db.close();

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

        const organization = rows[rowIndex];

        organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(organization.licences_endDateMax || 0);

        organization.canUpdate = canUpdateObject("organization", rows[rowIndex], reqSession);

        delete organization.recordCreate_userName;
        delete organization.recordCreate_timeMillis;
        delete organization.recordUpdate_userName;
        delete organization.recordUpdate_timeMillis;
      }

      return rows;
    },

    getOrganization: function(organizationID, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const organizationObj = db.prepare("select * from Organizations" +
          " where organizationID = ?")
        .get(organizationID);

      if (organizationObj) {

        organizationObj.canUpdate = canUpdateObject("organization", organizationObj, reqSession);

        const representativesList = db.prepare("select * from OrganizationRepresentatives" +
            " where organizationID = ?" +
            " order by isDefault desc, representativeName")
          .all(organizationID);

        organizationObj.organizationRepresentatives = representativesList;
      }

      db.close();

      return organizationObj;
    },

    createOrganization: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("insert into Organizations (" +
          "organizationName, organizationAddress1, organizationAddress2," +
          " organizationCity, organizationProvince, organizationPostalCode," +
          " organizationNote," +
          " recordCreate_userName, recordCreate_timeMillis," +
          " recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(
          reqBody.organizationName,
          reqBody.organizationAddress1,
          reqBody.organizationAddress2,
          reqBody.organizationCity,
          reqBody.organizationProvince,
          reqBody.organizationPostalCode,
          "",
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

      db.close();

      return info.lastInsertRowid;
    },

    updateOrganization: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update Organizations" +
          " set organizationName = ?," +
          " organizationAddress1 = ?," +
          " organizationAddress2 = ?," +
          " organizationCity = ?," +
          " organizationProvince = ?," +
          " organizationPostalCode = ?," +
          " isEligibleForLicences = ?," +
          " organizationNote = ?," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where organizationID = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqBody.organizationName,
          reqBody.organizationAddress1,
          reqBody.organizationAddress2,
          reqBody.organizationCity,
          reqBody.organizationProvince,
          reqBody.organizationPostalCode,
          reqBody.isEligibleForLicences,
          reqBody.organizationNote,
          reqSession.user.userName,
          nowMillis,
          reqBody.organizationID
        );

      db.close();

      return info.changes;
    },

    deleteOrganization: function(organizationID, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update Organizations" +
          " set recordDelete_userName = ?," +
          " recordDelete_timeMillis = ?" +
          " where organizationID = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqSession.user.userName,
          nowMillis,
          organizationID
        );

      db.close();

      return info.changes;
    },

    restoreOrganization: function(organizationID, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update Organizations" +
          " set recordDelete_userName = null," +
          " recordDelete_timeMillis = null," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where organizationID = ?" +
          " and recordDelete_timeMillis is not null")
        .run(
          reqSession.user.userName,
          nowMillis,
          organizationID
        );

      db.close();

      return info.changes;
    },

    /*
     * ORGANIZATION REPRESENTATIVES
     */

    addOrganizationRepresentative: function(organizationID, reqBody) {

      const db = sqlite(dbPath);

      const row = db.prepare("select count(representativeIndex) as indexCount, ifnull(max(representativeIndex), -1) as maxIndex" +
          " from OrganizationRepresentatives" +
          " where organizationID = ?")
        .get(organizationID);

      const newRepresentativeIndex = row.maxIndex + 1;
      const newIsDefault = (row.indexCount === 0 ? 1 : 0);

      db.prepare("insert into OrganizationRepresentatives (" +
          "organizationID, representativeIndex," +
          " representativeName, representativeTitle," +
          " representativeAddress1, representativeAddress2," +
          " representativeCity, representativeProvince, representativePostalCode," +
          " representativePhoneNumber, representativeEmailAddress," +
          " isDefault)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(organizationID, newRepresentativeIndex,
          reqBody.representativeName, reqBody.representativeTitle,
          reqBody.representativeAddress1, reqBody.representativeAddress2,
          reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
          reqBody.representativePhoneNumber, reqBody.representativeEmailAddress,
          newIsDefault);

      db.close();

      return {
        organizationID: organizationID,
        representativeIndex: newRepresentativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: newIsDefault
      };
    },

    updateOrganizationRepresentative: function(organizationID, reqBody) {

      const db = sqlite(dbPath);

      db.prepare("update OrganizationRepresentatives" +
          " set representativeName = ?," +
          " representativeTitle = ?," +
          " representativeAddress1 = ?," +
          " representativeAddress2 = ?," +
          " representativeCity = ?," +
          " representativeProvince = ?," +
          " representativePostalCode = ?," +
          " representativePhoneNumber = ?," +
          " representativeEmailAddress = ?" +
          " where organizationID = ?" +
          " and representativeIndex = ?")
        .run(reqBody.representativeName, reqBody.representativeTitle,
          reqBody.representativeAddress1, reqBody.representativeAddress2,
          reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
          reqBody.representativePhoneNumber, reqBody.representativeEmailAddress,
          organizationID, reqBody.representativeIndex
        );

      db.close();

      return {
        organizationID: organizationID,
        representativeIndex: reqBody.representativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: parseInt(reqBody.isDefault)
      };
    },

    deleteOrganizationRepresentative: function(organizationID, representativeIndex) {

      const db = sqlite(dbPath);

      db.prepare("delete from OrganizationRepresentatives" +
          " where organizationID = ?" +
          " and representativeIndex = ?")
        .run(organizationID, representativeIndex);

      db.close();

      return true;
    },

    setDefaultOrganizationRepresentative: function(organizationID, representativeIndex) {

      const db = sqlite(dbPath);

      db.prepare("update OrganizationRepresentatives" +
          " set isDefault = 0" +
          " where organizationID = ?")
        .run(organizationID);

      db.prepare("update OrganizationRepresentatives" +
          " set isDefault = 1" +
          " where organizationID = ?" +
          " and representativeIndex = ?")
        .run(organizationID, representativeIndex);

      db.close();

      return true;
    },

    /*
     * ORGANIZATION REMARKS
     */

    getOrganizationRemarks: function(organizationID, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const rows = db.prepare("select remarkIndex," +
          " remarkDate, remarkTime," +
          " remark, isImportant," +
          " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
          " from OrganizationRemarks" +
          " where recordDelete_timeMillis is null" +
          " and organizationID = ?" +
          " order by remarkDate desc, remarkTime desc")
        .all(organizationID);

      db.close();

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {

        const remark = rows[rowIndex];

        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);

        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);

        remark.canUpdate = canUpdateObject("remark", remark, reqSession);
      }

      return rows;
    },

    getOrganizationRemark: function(organizationID, remarkIndex, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const remark = db.prepare("select" +
          " remarkDate, remarkTime," +
          " remark, isImportant," +
          " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
          " from OrganizationRemarks" +
          " where recordDelete_timeMillis is null" +
          " and organizationID = ?" +
          " and remarkIndex = ?")
        .get(organizationID, remarkIndex);

      db.close();


      remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
      remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);

      remark.canUpdate = canUpdateObject("remark", remark, reqSession);

      return remark;
    },

    addOrganizationRemark: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const row = db.prepare("select ifnull(max(remarkIndex), -1) as maxIndex" +
          " from OrganizationRemarks" +
          " where organizationID = ?")
        .get(reqBody.organizationID);

      const newRemarkIndex = row.maxIndex + 1;

      const rightNow = new Date();

      const remarkDate = dateTimeFns.dateToInteger(rightNow);
      const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);

      db.prepare("insert into OrganizationRemarks (" +
          "organizationID, remarkIndex," +
          " remarkDate, remarkTime, remark, isImportant," +
          " recordCreate_userName, recordCreate_timeMillis," +
          " recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newRemarkIndex,
          remarkDate, remarkTime,
          reqBody.remark, 0,
          reqSession.user.userName,
          rightNow.getTime(),
          reqSession.user.userName,
          rightNow.getTime());

      db.close();

      return newRemarkIndex;
    },

    updateOrganizationRemark: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update OrganizationRemarks" +
          " set remarkDate = ?," +
          " remarkTime = ?," +
          " remark = ?," +
          " isImportant = ?," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where organizationID = ?" +
          " and remarkIndex = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          dateTimeFns.dateStringToInteger(reqBody.remarkDateString),
          dateTimeFns.timeStringToInteger(reqBody.remarkTimeString),
          reqBody.remark,
          reqBody.isImportant ? 1 : 0,
          reqSession.user.userName,
          nowMillis,
          reqBody.organizationID,
          reqBody.remarkIndex);

      let changeCount = info.changes;

      db.close();

      return changeCount;
    },

    deleteOrganizationRemark: function(organizationID, remarkIndex, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update OrganizationRemarks" +
          " set recordDelete_userName = ?," +
          " recordDelete_timeMillis = ?" +
          " where organizationID = ?" +
          " and remarkIndex = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqSession.user.userName,
          nowMillis,
          organizationID,
          remarkIndex);

      let changeCount = info.changes;

      db.close();

      return changeCount;
    },

    /*
     * LICENCES
     */

    getLicences: function(reqBody_or_paramsObj, includeOrganization, useLimit, reqSession) {

      if (reqBody_or_paramsObj.organizationName && reqBody_or_paramsObj.organizationName !== "") {
        includeOrganization = true;
      }

      const db = sqlite(dbPath, {
        readonly: true
      });

      let params = [];

      let sql = "select l.licenceID, l.organizationID," +
        (includeOrganization ?
          " o.organizationName," :
          "") +
        " l.applicationDate, l.licenceTypeKey," +
        " l.startDate, l.startTime, l.endDate, l.endTime," +
        " l.locationID, lo.locationName, lo.locationAddress1," +
        " l.municipality, l.licenceDetails, l.termsConditions," +
        " l.externalLicenceNumber, l.licenceFeeIsPaid," +
        " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
        " from LotteryLicences l" +
        " left join Locations lo on l.locationID = lo.locationID" +
        (includeOrganization ?
          " left join Organizations o on l.organizationID = o.organizationID" :
          ""
        ) +
        " where l.recordDelete_timeMillis is null";

      if (reqBody_or_paramsObj.organizationID && reqBody_or_paramsObj.organizationID !== "") {
        sql += " and l.organizationID = ?";
        params.push(reqBody_or_paramsObj.organizationID);
      }

      if (reqBody_or_paramsObj.organizationName && reqBody_or_paramsObj.organizationName !== "") {

        const organizationNamePieces = reqBody_or_paramsObj.organizationName.toLowerCase().split(" ");

        for (let pieceIndex = 0; pieceIndex < organizationNamePieces.length; pieceIndex += 1) {
          sql += " and instr(lower(o.organizationName), ?)";
          params.push(organizationNamePieces[pieceIndex]);
        }
      }

      if (reqBody_or_paramsObj.licenceTypeKey && reqBody_or_paramsObj.licenceTypeKey !== "") {
        sql += " and l.licenceTypeKey = ?";
        params.push(reqBody_or_paramsObj.licenceTypeKey);
      }

      if (reqBody_or_paramsObj.licenceStatus) {
        if (reqBody_or_paramsObj.licenceStatus === "past") {
          sql += " and l.endDate < ?";
          params.push(dateTimeFns.dateToInteger(new Date()));
        } else if (reqBody_or_paramsObj.licenceStatus === "active") {
          sql += " and l.endDate >= ?";
          params.push(dateTimeFns.dateToInteger(new Date()));
        }
      }

      if (reqBody_or_paramsObj.locationID) {
        sql += " and (l.locationID = ?" +
          " or licenceID in (select licenceID from LotteryLicenceTicketTypes where recordDelete_timeMillis is null and (distributorLocationID = ? or manufacturerLocationID = ?))" +
          ")";

        params.push(reqBody_or_paramsObj.locationID);
        params.push(reqBody_or_paramsObj.locationID);
        params.push(reqBody_or_paramsObj.locationID);
      }

      sql += " order by l.endDate desc, l.startDate desc, l.licenceID";

      if (useLimit) {
        sql += " limit 100";
      }

      let rows = db.prepare(sql).all(params);

      for (let index = 0; index < rows.length; index += 1) {
        const licenceObj = rows[index];

        licenceObj.applicationDateString = dateTimeFns.dateIntegerToString(licenceObj.applicationDate || 0);

        licenceObj.startDateString = dateTimeFns.dateIntegerToString(licenceObj.startDate || 0);
        licenceObj.endDateString = dateTimeFns.dateIntegerToString(licenceObj.endDate || 0);

        licenceObj.startTimeString = dateTimeFns.timeIntegerToString(licenceObj.startTime || 0);
        licenceObj.endTimeString = dateTimeFns.timeIntegerToString(licenceObj.endTime || 0);

        licenceObj.locationDisplayName = (licenceObj.locationName === "" ? licenceObj.locationAddress1 : licenceObj.locationName);

        licenceObj.canUpdate = canUpdateObject("licence", licenceObj, reqSession);
      }

      db.close();

      return rows;
    },

    getLicence: function(licenceID, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const licenceObj = getLicence(licenceID, reqSession, db);

      db.close();

      return licenceObj;
    },

    getNextExternalLicenceNumberFromRange: function() {

      const db = sqlite(dbPath, {
        readonly: true
      });

      let rangeStart = parseInt(getApplicationSetting(db, "licences.externalLicenceNumber.range.start") || "-1");

      let rangeEnd = parseInt(getApplicationSetting(db, "licences.externalLicenceNumber.range.end") || "0");

      let row = db.prepare("select max(externalLicenceNumberInteger) as maxExternalLicenceNumberInteger" +
          " from LotteryLicences" +
          " where externalLicenceNumberInteger >= ?" +
          " and externalLicenceNumberInteger <= ?")
        .get(rangeStart, rangeEnd);

      db.close();

      if (!row) {
        return rangeStart;
      }

      let maxExternalLicenceNumber = row.maxExternalLicenceNumberInteger;

      if (!maxExternalLicenceNumber) {
        return rangeStart;
      }

      let newExternalLicenceNumber = maxExternalLicenceNumber + 1;

      if (newExternalLicenceNumber > rangeEnd) {
        return -1;
      }

      return newExternalLicenceNumber;
    },

    createLicence: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      let externalLicenceNumberInteger = -1;

      try {
        externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber);
      } catch (e) {
        externalLicenceNumberInteger = -1;
      }

      const info = db.prepare("insert into LotteryLicences (" +
          "organizationID, applicationDate, licenceTypeKey," +
          " startDate, endDate, startTime, endTime," +
          " locationID, municipality, licenceDetails, termsConditions, totalPrizeValue," +
          " externalLicenceNumber, externalLicenceNumberInteger," +
          " recordCreate_userName, recordCreate_timeMillis," +
          " recordUpdate_userName, recordUpdate_timeMillis)" +
          " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(
          reqBody.organizationID,
          dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
          reqBody.licenceTypeKey,
          dateTimeFns.dateStringToInteger(reqBody.startDateString),
          dateTimeFns.dateStringToInteger(reqBody.endDateString),
          dateTimeFns.timeStringToInteger(reqBody.startTimeString),
          dateTimeFns.timeStringToInteger(reqBody.endTimeString),
          (reqBody.locationID === "" ? null : reqBody.locationID),
          reqBody.municipality,
          reqBody.licenceDetails,
          reqBody.termsConditions,
          reqBody.totalPrizeValue,
          reqBody.externalLicenceNumber,
          externalLicenceNumberInteger,
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis
        );

      const licenceID = info.lastInsertRowid;

      // fields

      const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

      for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

        const fieldKey = fieldKeys[fieldIndex];
        const fieldValue = reqBody[fieldKey];

        if (fieldValue !== "") {
          db.prepare("insert into LotteryLicenceFields" +
              " (licenceID, fieldKey, fieldValue)" +
              " values (?, ?, ?)")
            .run(licenceID, fieldKey, fieldValue);
        }
      }

      // ticket types

      if (typeof(reqBody.ticketType_ticketType) === "string") {

        db.prepare("insert into LotteryLicenceTicketTypes (" +
            "licenceID, ticketType," +
            " distributorLocationID, manufacturerLocationID," +
            " unitCount, licenceFee," +
            " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .run(licenceID,
            reqBody.ticketType_ticketType,
            (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID),
            (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID),
            reqBody.ticketType_unitCount,
            reqBody.ticketType_licenceFee,
            reqSession.user.userName,
            nowMillis,
            reqSession.user.userName,
            nowMillis);

      } else if (typeof(reqBody.ticketType_ticketType) === "object") {

        for (let ticketTypeIndex = 0; ticketTypeIndex < reqBody.ticketType_ticketType.length; ticketTypeIndex += 1) {

          db.prepare("insert into LotteryLicenceTicketTypes (" +
              "licenceID, ticketType," +
              " distributorLocationID, manufacturerLocationID," +
              " unitCount, licenceFee," +
              " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
              " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(licenceID,
              reqBody.ticketType_ticketType[ticketTypeIndex],
              (reqBody.ticketType_distributorLocationID[ticketTypeIndex] === "" ? null : reqBody.ticketType_distributorLocationID[ticketTypeIndex]),
              (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === "" ? null : reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]),
              reqBody.ticketType_unitCount[ticketTypeIndex],
              reqBody.ticketType_licenceFee[ticketTypeIndex],
              reqSession.user.userName,
              nowMillis,
              reqSession.user.userName,
              nowMillis);
        }
      }

      // events

      if (typeof(reqBody.eventDate) === "string") {

        db.prepare("insert into LotteryEvents (" +
            "licenceID, eventDate," +
            " recordCreate_userName, recordCreate_timeMillis," +
            " recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?)")
          .run(
            licenceID,
            dateTimeFns.dateStringToInteger(reqBody.eventDate),
            reqSession.user.userName,
            nowMillis,
            reqSession.user.userName,
            nowMillis);

      } else if (typeof(reqBody.eventDate) === "object") {

        for (let eventIndex = 0; eventIndex < reqBody.eventDate.length; eventIndex += 1) {

          db.prepare("insert or ignore into LotteryEvents (" +
              "licenceID, eventDate," +
              " recordCreate_userName, recordCreate_timeMillis," +
              " recordUpdate_userName, recordUpdate_timeMillis)" +
              " values (?, ?, ?, ?, ?, ?)")
            .run(
              licenceID,
              dateTimeFns.dateStringToInteger(reqBody.eventDate[eventIndex]),
              reqSession.user.userName,
              nowMillis,
              reqSession.user.userName,
              nowMillis);
        }
      }

      db.close();

      return licenceID;
    },

    updateLicence: function(reqBody, reqSession) {

      // check if can update

      const db = sqlite(dbPath);

      const licenceObj_past = getLicence(reqBody.licenceID, reqSession, db);

      if (!licenceObj_past.canUpdate) {
        db.close();
        return 0;
      }

      const nowMillis = Date.now();

      let externalLicenceNumberInteger = -1;

      try {
        externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber);
      } catch (e) {
        externalLicenceNumberInteger = -1;
      }

      // update licence

      const startDate_now = dateTimeFns.dateStringToInteger(reqBody.startDateString);
      const endDate_now = dateTimeFns.dateStringToInteger(reqBody.endDateString);
      const startTime_now = dateTimeFns.timeStringToInteger(reqBody.startTimeString);
      const endTime_now = dateTimeFns.timeStringToInteger(reqBody.endTimeString);

      const info = db.prepare("update LotteryLicences" +
          " set organizationID = ?," +
          " applicationDate = ?," +
          " licenceTypeKey = ?," +
          " startDate = ?," +
          " endDate = ?," +
          " startTime = ?," +
          " endTime = ?," +
          " locationID = ?," +
          " municipality = ?," +
          " licenceDetails = ?," +
          " termsConditions = ?," +
          " totalPrizeValue = ?," +
          " externalLicenceNumber = ?," +
          " externalLicenceNumberInteger = ?," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqBody.organizationID,
          dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
          reqBody.licenceTypeKey,
          startDate_now,
          endDate_now,
          startTime_now,
          endTime_now,
          (reqBody.locationID === "" ? null : reqBody.locationID),
          reqBody.municipality,
          reqBody.licenceDetails,
          reqBody.termsConditions,
          reqBody.totalPrizeValue,
          reqBody.externalLicenceNumber,
          externalLicenceNumberInteger,
          reqSession.user.userName,
          nowMillis,
          reqBody.licenceID
        );

      const changeCount = info.changes;

      if (!changeCount) {
        db.close();
        return changeCount;
      }

      // record amendments (if necessary)

      let newAmendmentIndex = -1;

      const nowDate = new Date(nowMillis);
      const newAmendmentDate = dateTimeFns.dateToInteger(nowDate);
      const newAmendmentTime = dateTimeFns.dateToTimeInteger(nowDate);

      if (licenceObj_past.trackUpdatesAsAmendments) {

        for (let arrayIndex = 0; arrayIndex < licenceObj_past.licenceAmendments.length; arrayIndex += 1) {
          newAmendmentIndex = Math.max(newAmendmentIndex, licenceObj_past.licenceAmendments[arrayIndex].amendmentIndex);
        }

        newAmendmentIndex += 1;

        if (licenceObj_past.startDate !== startDate_now ||
          licenceObj_past.endDate !== endDate_now ||
          licenceObj_past.startTime !== startTime_now ||
          licenceObj_past.endTime !== endTime_now) {

          newAmendmentIndex += 1;

          const amendment = (
            (licenceObj_past.startDate !== startDate_now ?
              `Start Date: ${licenceObj_past.startDate} -> ${startDate_now}` + "\n " :
              "") +
            (licenceObj_past.endDate !== endDate_now ?
              `End Date: ${licenceObj_past.endDate} -> ${endDate_now}` + "\n" :
              "") +
            (licenceObj_past.startTime !== startTime_now ?
              `Start Time: ${licenceObj_past.startTime} -> ${startTime_now}` + "\n" :
              "") +
            (licenceObj_past.endTime !== endTime_now ?
              `End Time: ${licenceObj_past.endTime} -> ${endTime_now}` + "\n" :
              "")).trim();

          db.prepare("insert into LotteryLicenceAmendments" +
              " (licenceID, amendmentIndex, amendmentDate, amendmentTime, amendmentType, amendment, isHidden," +
              " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
              " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .run(reqBody.licenceID,
              newAmendmentIndex,
              newAmendmentDate,
              newAmendmentTime,
              "Licence Dates Update",
              amendment,
              0,
              reqSession.user.userName,
              nowMillis,
              reqSession.user.userName,
              nowMillis);
        }
      }

      // fields

      db.prepare("delete from LotteryLicenceFields" +
          " where licenceID = ?")
        .run(reqBody.licenceID);

      const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

      for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

        const fieldKey = fieldKeys[fieldIndex];
        const fieldValue = reqBody[fieldKey];

        if (fieldKey === "" || fieldValue === "") {
          continue;
        }

        db.prepare("insert into LotteryLicenceFields" +
            " (licenceID, fieldKey, fieldValue)" +
            " values (?, ?, ?)")
          .run(reqBody.licenceID, fieldKey, fieldValue);
      }

      /*
       * ticket types
       */

      // do deletes

      if (typeof(reqBody.ticketType_toDelete) === "string") {

        db.prepare("update LotteryLicenceTicketTypes" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and ticketType = ?")
          .run(reqSession.user.userName,
            nowMillis,
            reqBody.licenceID,
            reqBody.ticketType_toDelete);

      } else if (typeof(reqBody.ticketType_toDelete) === "object") {

        for (let deleteIndex = 0; deleteIndex < reqBody.ticketType_toDelete.length; deleteIndex += 1) {

          db.prepare("update LotteryLicenceTicketTypes" +
              " set recordDelete_userName = ?," +
              " recordDelete_timeMillis = ?" +
              " where licenceID = ?" +
              " and ticketType = ?")
            .run(reqSession.user.userName,
              nowMillis,
              reqBody.licenceID,
              reqBody.ticketType_toDelete[deleteIndex]);
        }
      }

      // do adds

      if (typeof(reqBody.ticketType_toAdd) === "string") {

        const addInfo = db.prepare("update LotteryLicenceTicketTypes" +
            " set costs_receipts = null," +
            " costs_admin = null," +
            " costs_prizesAwarded = null," +
            " recordDelete_userName = null," +
            " recordDelete_timeMillis = null," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where licenceID = ?" +
            " and ticketType = ?" +
            " and recordDelete_timeMillis is not null")
          .run(reqSession.user.userName,
            nowMillis,
            reqBody.licenceID,
            reqBody.ticketType_toAdd);

        if (addInfo.changes === 0) {

          db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
              " (licenceID, ticketType, unitCount," +
              " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
              " values (?, ?, ?, ?, ?, ?, ?)")
            .run(reqBody.licenceID,
              reqBody.ticketType_toAdd,
              0,
              reqSession.user.userName,
              nowMillis,
              reqSession.user.userName,
              nowMillis);
        }

      } else if (typeof(reqBody.ticketType_toAdd) === "object") {

        for (let addIndex = 0; addIndex < reqBody.ticketType_toAdd.length; addIndex += 1) {

          const addInfo = db.prepare("update LotteryLicenceTicketTypes" +
              " set costs_receipts = null," +
              " costs_admin = null," +
              " costs_prizesAwarded = null," +
              " recordDelete_userName = null," +
              " recordDelete_timeMillis = null," +
              " recordUpdate_userName = ?," +
              " recordUpdate_timeMillis = ?" +
              " where licenceID = ?" +
              " and ticketType = ?" +
              " and recordDelete_timeMillis is not null")
            .run(reqSession.user.userName,
              nowMillis,
              reqBody.licenceID,
              reqBody.ticketType_toAdd[addIndex]);

          if (addInfo.changes === 0) {

            db.prepare("insert or ignore into LotteryLicenceTicketTypes" +
                " (licenceID, ticketType, unitCount," +
                " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
                " values (?, ?, ?, ?, ?, ?, ?)")
              .run(reqBody.licenceID,
                reqBody.ticketType_toAdd[addIndex],
                0,
                reqSession.user.userName,
                nowMillis,
                reqSession.user.userName,
                nowMillis);
          }
        }
      }

      // do updates

      if (typeof(reqBody.ticketType_ticketType) === "string") {

        db.prepare("update LotteryLicenceTicketTypes" +
            " set distributorLocationID = ?," +
            " manufacturerLocationID = ?," +
            " unitCount = ?," +
            " licenceFee = ?," +
            " recordUpdate_userName = ?," +
            " recordUpdate_timeMillis = ?" +
            " where licenceID = ?" +
            " and ticketType = ?" +
            " and recordDelete_timeMillis is null")
          .run(
            (reqBody.ticketType_distributorLocationID === "" ? null : reqBody.ticketType_distributorLocationID),
            (reqBody.ticketType_manufacturerLocationID === "" ? null : reqBody.ticketType_manufacturerLocationID),
            reqBody.ticketType_unitCount,
            reqBody.ticketType_licenceFee,
            reqSession.user.userName,
            nowMillis,
            reqBody.licenceID,
            reqBody.ticketType_ticketType);

      } else if (typeof(reqBody.ticketType_ticketType) === "object") {

        for (let ticketTypeIndex = 0; ticketTypeIndex < reqBody.ticketType_ticketType.length; ticketTypeIndex += 1) {

          db.prepare("update LotteryLicenceTicketTypes" +
              " set distributorLocationID = ?," +
              " manufacturerLocationID = ?," +
              " unitCount = ?," +
              " licenceFee = ?," +
              " recordUpdate_userName = ?," +
              " recordUpdate_timeMillis = ?" +
              " where licenceID = ?" +
              " and ticketType = ?" +
              " and recordDelete_timeMillis is null")
            .run(
              (reqBody.ticketType_distributorLocationID[ticketTypeIndex] === "" ? null : reqBody.ticketType_distributorLocationID[ticketTypeIndex]),
              (reqBody.ticketType_manufacturerLocationID[ticketTypeIndex] === "" ? null : reqBody.ticketType_manufacturerLocationID[ticketTypeIndex]),
              reqBody.ticketType_unitCount[ticketTypeIndex],
              reqBody.ticketType_licenceFee[ticketTypeIndex],
              reqSession.user.userName,
              nowMillis,
              reqBody.licenceID,
              reqBody.ticketType_ticketType[ticketTypeIndex]);
        }
      }

      // events

      if (typeof(reqBody.eventDate) !== "undefined") {

        // purge any deleted events to avoid conflicts

        db.prepare("delete from LotteryEventFields" +
            " where licenceID = ?" +
            " and eventDate in (select eventDate from LotteryEvents where licenceID = ? and recordDelete_timeMillis is not null)")
          .run(reqBody.licenceID, reqBody.licenceID);

        db.prepare("delete from LotteryEvents" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is not null")
          .run(reqBody.licenceID);
      }

      if (typeof(reqBody.eventDate) === "string") {

        db.prepare("insert or ignore into LotteryEvents (" +
            "licenceID, eventDate," +
            " recordCreate_userName, recordCreate_timeMillis," +
            " recordUpdate_userName, recordUpdate_timeMillis)" +
            " values (?, ?, ?, ?, ?, ?)")
          .run(
            reqBody.licenceID,
            dateTimeFns.dateStringToInteger(reqBody.eventDate),
            reqSession.user.userName,
            nowMillis,
            reqSession.user.userName,
            nowMillis);

      } else if (typeof(reqBody.eventDate) === "object") {

        for (let eventIndex = 0; eventIndex < reqBody.eventDate.length; eventIndex += 1) {

          db.prepare("insert or ignore into LotteryEvents (" +
              "licenceID, eventDate," +
              " recordCreate_userName, recordCreate_timeMillis," +
              " recordUpdate_userName, recordUpdate_timeMillis)" +
              " values (?, ?, ?, ?, ?, ?)")
            .run(
              reqBody.licenceID,
              dateTimeFns.dateStringToInteger(reqBody.eventDate[eventIndex]),
              reqSession.user.userName,
              nowMillis,
              reqSession.user.userName,
              nowMillis);
        }
      }

      db.close();

      return changeCount;
    },

    deleteLicence: function(licenceID, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryLicences" +
          " set recordDelete_userName = ?," +
          " recordDelete_timeMillis = ?" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqSession.user.userName,
          nowMillis,
          licenceID
        );

      let changeCount = info.changes;

      if (changeCount) {
        db.prepare("update LotteryEvents" +
            " set recordDelete_userName = ?," +
            " recordDelete_timeMillis = ?" +
            " where licenceID = ?" +
            " and recordDelete_timeMillis is null")
          .run(
            reqSession.user.userName,
            nowMillis,
            licenceID
          );
      }

      db.close();

      return changeCount;
    },

    getDistinctTermsConditions: function(organizationID) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const rows = db.prepare("select termsConditions," +
          " count(licenceID) as termsConditionsCount," +
          " max(startDate) as startDateMax" +
          " from LotteryLicences l" +
          " where l.organizationID = ?" +
          " and l.termsConditions is not null and trim(l.termsConditions) <> ''" +
          " and l.recordDelete_timeMillis is null" +
          " group by l.termsConditions" +
          " order by startDateMax desc")
        .all(organizationID);

      db.close();

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const termsConditionsObj = rows[rowIndex];
        termsConditionsObj.startDateMaxString = dateTimeFns.dateIntegerToString(termsConditionsObj.startDateMax);
      }

      return rows;
    },

    pokeLicence: function(licenceID, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryLicences" +
          " set recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqSession.user.userName,
          nowMillis,
          licenceID
        );

      let changeCount = info.changes;

      db.close();

      return changeCount;
    },

    markLicenceFeePaid: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryLicences" +
          " set licenceFee = ?," +
          " externalReceiptNumber = ?," +
          " licenceFeeIsPaid = 1," +
          " trackUpdatesAsAmendments = 1," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null" +
          " and licenceFeeIsPaid = 0")
        .run(
          reqBody.licenceFee,
          reqBody.externalReceiptNumber,
          reqSession.user.userName,
          nowMillis,
          reqBody.licenceID
        );

      const changeCount = info.changes;

      db.close();

      return changeCount;
    },

    markLicenceFeeUnpaid: function(licenceID, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryLicences" +
          " set licenceFee = null," +
          " externalReceiptNumber = null," +
          " licenceFeeIsPaid = 0," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where licenceID = ?" +
          " and recordDelete_timeMillis is null" +
          " and licenceFeeIsPaid = 1")
        .run(
          reqSession.user.userName,
          nowMillis,
          licenceID
        );

      const changeCount = info.changes;

      db.close();

      return changeCount;
    },

    /*
     * EVENTS
     */

    getEvents: function(year, month, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      let rows = db.prepare("select e.eventDate, e.bank_name, e.costs_receipts," +
          " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails," +
          " lo.locationName, lo.locationAddress1," +
          " l.startTime, l.endTime," +
          " o.organizationName," +
          " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
          " from LotteryEvents e" +
          " left join LotteryLicences l on e.licenceID = l.licenceID" +
          " left join Locations lo on l.locationID = lo.locationID" +
          " left join Organizations o on l.organizationID = o.organizationID" +
          " where e.recordDelete_timeMillis is null" +
          " and l.recordDelete_timeMillis is null" +
          " and o.recordDelete_timeMillis is null" +
          " and e.eventDate > ((? * 10000) + (? * 100))" +
          " and e.eventDate < ((? * 10000) + (? * 100) + 99)" +
          " order by e.eventDate, l.startTime")
        .all(year, month, year, month);

      db.close();

      for (let eventIndex = 0; eventIndex < rows.length; eventIndex += 1) {
        const eventObj = rows[eventIndex];

        eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);

        eventObj.startTimeString = dateTimeFns.timeIntegerToString(eventObj.startTime || 0);
        eventObj.endTimeString = dateTimeFns.timeIntegerToString(eventObj.endTime || 0);

        eventObj.locationDisplayName = (eventObj.locationName === "" ? eventObj.locationAddress1 : eventObj.locationName);

        eventObj.canUpdate = canUpdateObject("event", eventObj, reqSession);

        delete eventObj.locationName;
        delete eventObj.locationAddress1;
        delete eventObj.bank_name;
        delete eventObj.costs_receipts;
      }

      return rows;
    },

    getEvent: function(licenceID, eventDate, reqSession) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const eventObj = db.prepare("select * from LotteryEvents" +
          " where recordDelete_timeMillis is null" +
          " and licenceID = ?" +
          " and eventDate = ?")
        .get(licenceID, eventDate);

      if (eventObj) {

        eventObj.eventDateString = dateTimeFns.dateIntegerToString(eventObj.eventDate);

        eventObj.startTimeString = dateTimeFns.timeIntegerToString(eventObj.startTime || 0);
        eventObj.endTimeString = dateTimeFns.timeIntegerToString(eventObj.endTime || 0);

        eventObj.canUpdate = canUpdateObject("event", eventObj, reqSession);

        const rows = db.prepare("select fieldKey, fieldValue" +
            " from LotteryEventFields" +
            " where licenceID = ? and eventDate = ?")
          .all(licenceID, eventDate);

        eventObj.eventFields = rows || [];
      }

      db.close();

      return eventObj;
    },

    updateEvent: function(reqBody, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryEvents" +
          " set bank_name = ?," +
          " bank_address = ?," +
          " bank_accountNumber = ?," +
          " bank_accountBalance = ?," +
          " costs_receipts = ?," +
          " costs_admin = ?," +
          " costs_prizesAwarded = ?," +
          " costs_charitableDonations = ?," +
          " costs_netProceeds = ?," +
          " costs_amountDonated = ?," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where licenceID = ?" +
          " and eventDate = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqBody.bank_name,
          reqBody.bank_address,
          reqBody.bank_accountNumber,
          reqBody.bank_accountBalance,
          reqBody.costs_receipts,
          reqBody.costs_admin,
          reqBody.costs_prizesAwarded,
          reqBody.costs_charitableDonations,
          reqBody.costs_netProceeds,
          reqBody.costs_amountDonated,
          reqSession.user.userName,
          nowMillis,
          reqBody.licenceID,
          reqBody.eventDate
        );

      const changeCount = info.changes;

      if (!changeCount) {
        db.close();
        return changeCount;
      }

      // fields

      db.prepare("delete from LotteryEventFields" +
          " where licenceID = ?" +
          " and eventDate = ?")
        .run(reqBody.licenceID, reqBody.eventDate);

      const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

      for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

        const fieldKey = fieldKeys[fieldIndex];
        const fieldValue = reqBody[fieldKey];

        if (fieldValue !== "") {
          db.prepare("insert into LotteryEventFields" +
              " (licenceID, eventDate, fieldKey, fieldValue)" +
              " values (?, ?, ?, ?)")
            .run(reqBody.licenceID, reqBody.eventDate, fieldKey, fieldValue);
        }
      }

      db.close();

      return changeCount;
    },

    deleteEvent: function(licenceID, eventDate, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryEvents" +
          " set recordDelete_userName = ?," +
          " recordDelete_timeMillis = ?" +
          " where licenceID = ?" +
          " and eventDate = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqSession.user.userName,
          nowMillis,
          licenceID,
          eventDate
        );

      let changeCount = info.changes;

      db.close();

      return changeCount;
    },

    pokeEvent: function(licenceID, eventDate, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update LotteryEvents" +
          " set recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where licenceID = ?" +
          " and eventDate = ?" +
          " and recordDelete_timeMillis is null")
        .run(
          reqSession.user.userName,
          nowMillis,
          licenceID,
          eventDate
        );

      let changeCount = info.changes;

      db.close();

      return changeCount;
    },

    /*
     * APPLICATION SETTINGS
     */

    getApplicationSettings: function() {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const rows = db.prepare("select * from ApplicationSettings order by orderNumber, settingKey").all();

      db.close();

      return rows;
    },

    getApplicationSetting: function(settingKey) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const settingValue = getApplicationSetting(db, settingKey);

      db.close();

      return settingValue;
    },

    updateApplicationSetting: function(settingKey, settingValue, reqSession) {

      const db = sqlite(dbPath);

      const nowMillis = Date.now();

      const info = db.prepare("update ApplicationSettings" +
          " set settingValue = ?," +
          " recordUpdate_userName = ?," +
          " recordUpdate_timeMillis = ?" +
          " where settingKey = ?")
        .run(
          settingValue,
          reqSession.user.userName,
          nowMillis,
          settingKey
        );

      const changeCount = info.changes;

      db.close();

      return changeCount;
    }
  };
}());


module.exports = licencesDB;
