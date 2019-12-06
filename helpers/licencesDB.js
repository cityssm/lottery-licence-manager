/* global require, module */


const dateTimeFns = require("./dateTimeFns");

const sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";


function getApplicationSetting(db, settingKey) {
  "use strict";

  const row = db.prepare("select SettingValue" +
      " from ApplicationSettings" +
      " where SettingKey = ?")
    .get(settingKey);

  if (row) {
    return row.SettingValue || "";
  } else {
    return "";
  }
}


let licencesDB = {

  /*
   * ORGANIZATIONS
   */

  getOrganizations: function(reqBody, useLimit) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    let params = [];

    let sql = "select OrganizationID, OrganizationName" +
      " from Organizations" +
      " where RecordDelete_TimeMillis is null";

    if (reqBody.organizationName && reqBody.organizationName !== "") {
      sql += " and instr(lower(OrganizationName), ?)";
      params.push(reqBody.organizationName.toLowerCase());
    }

    if (reqBody.representativeName && reqBody.representativeName !== "") {
      sql += " and OrganizationID in (select OrganizationID from OrganizationRepresentatives where instr(lower(RepresentativeName), ?))";
      params.push(reqBody.representativeName.toLowerCase());
    }

    sql += " order by OrganizationName, OrganizationID";

    if (useLimit) {
      sql += " limit 100";
    }

    let rows = db.prepare(sql).all(params);

    db.close();

    return rows;
  },

  getOrganization: function(organizationID) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const organizationObj = db.prepare("select * from Organizations" +
        " where RecordDelete_TimeMillis is null" +
        " and OrganizationID = ?")
      .get(organizationID);

    if (organizationObj) {

      const representativesList = db.prepare("select * from OrganizationRepresentatives" +
          " where OrganizationID = ?" +
          " order by IsDefault desc, RepresentativeName")
        .all(organizationID);

      organizationObj.organizationRepresentatives = representativesList;
    }

    db.close();

    return organizationObj;
  },


  createOrganization: function(reqBody, reqSession) {
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("insert into Organizations (" +
        "OrganizationName, OrganizationAddress1, OrganizationAddress2," +
        " OrganizationCity, OrganizationProvince, OrganizationPostalCode," +
        " RecordCreate_UserName, RecordCreate_TimeMillis," +
        " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        reqBody.organizationName,
        reqBody.organizationAddress1,
        reqBody.organizationAddress2,
        reqBody.organizationCity,
        reqBody.organizationProvince,
        reqBody.organizationPostalCode,
        reqSession.user.userName,
        nowMillis,
        reqSession.user.userName,
        nowMillis
      );

    db.close();

    return info.lastInsertRowid;
  },

  updateOrganization: function(reqBody, reqSession) {
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update Organizations" +
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
        reqBody.organizationName,
        reqBody.organizationAddress1,
        reqBody.organizationAddress2,
        reqBody.organizationCity,
        reqBody.organizationProvince,
        reqBody.organizationPostalCode,
        reqSession.user.userName,
        nowMillis,
        reqBody.organizationID
      );

    db.close();

    return info.changes;
  },


  addOrganizationRepresentative: function(organizationID, reqBody) {
    "use strict";

    const db = sqlite(dbPath);

    const row = db.prepare("select count(RepresentativeIndex) as IndexCount, ifnull(max(RepresentativeIndex), -1) as MaxIndex" +
        " from OrganizationRepresentatives" +
        " where OrganizationID = ?")
      .get(organizationID);

    const newRepresentativeIndex = row.MaxIndex + 1;
    const newIsDefault = (row.IndexCount === 0 ? 1 : 0);

    db.prepare("insert into OrganizationRepresentatives (" +
        "OrganizationID, RepresentativeIndex," +
        " RepresentativeName, RepresentativeTitle," +
        " RepresentativeAddress1, RepresentativeAddress2," +
        " RepresentativeCity, RepresentativeProvince, RepresentativePostalCode," +
        " RepresentativePhoneNumber," +
        " IsDefault)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(organizationID, newRepresentativeIndex,
        reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
        reqBody.representativePhoneNumber,
        newIsDefault);

    db.close();

    return {
      OrganizationID: organizationID,
      RepresentativeIndex: newRepresentativeIndex,
      RepresentativeName: reqBody.representativeName,
      RepresentativeTitle: reqBody.representativeTitle,
      RepresentativeAddress1: reqBody.representativeAddress1,
      RepresentativeAddress2: reqBody.representativeAddress2,
      RepresentativeCity: reqBody.representativeCity,
      RepresentativeProvince: reqBody.representativeProvince,
      RepresentativePostalCode: reqBody.representativePostalCode,
      RepresentativePhoneNumber: reqBody.representativePhoneNumber,
      IsDefault: newIsDefault
    };
  },

  updateOrganizationRepresentative: function(organizationID, reqBody) {
    "use strict";

    const db = sqlite(dbPath);

    db.prepare("update OrganizationRepresentatives" +
        " set RepresentativeName = ?," +
        " RepresentativeTitle = ?," +
        " RepresentativeAddress1 = ?," +
        " RepresentativeAddress2 = ?," +
        " RepresentativeCity = ?," +
        " RepresentativeProvince = ?," +
        " RepresentativePostalCode = ?," +
        " RepresentativePhoneNumber = ?" +
        " where OrganizationID = ?" +
        " and RepresentativeIndex = ?")
      .run(reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
        reqBody.representativePhoneNumber,
        organizationID, reqBody.representativeIndex
      );

    db.close();

    return {
      OrganizationID: organizationID,
      RepresentativeIndex: reqBody.representativeIndex,
      RepresentativeName: reqBody.representativeName,
      RepresentativeTitle: reqBody.representativeTitle,
      RepresentativeAddress1: reqBody.representativeAddress1,
      RepresentativeAddress2: reqBody.representativeAddress2,
      RepresentativeCity: reqBody.representativeCity,
      RepresentativeProvince: reqBody.representativeProvince,
      RepresentativePostalCode: reqBody.representativePostalCode,
      RepresentativePhoneNumber: reqBody.representativePhoneNumber,
      IsDefault: reqBody.isDefault
    };
  },

  deleteOrganizationRepresentative: function(organizationID, representativeIndex) {

    "use strict";

    const db = sqlite(dbPath);

    db
      .prepare("delete from OrganizationRepresentatives" +
        " where OrganizationID = ?" +
        " and RepresentativeIndex = ?")
      .run(organizationID, representativeIndex);

    db.close();

    return true;
  },

  setDefaultOrganizationRepresentative: function(organizationID, representativeIndex) {
    "use strict";

    const db = sqlite(dbPath);

    db
      .prepare("update OrganizationRepresentatives set IsDefault = 0 where OrganizationID = ?")
      .run(organizationID);

    db.prepare("update OrganizationRepresentatives" +
        " set IsDefault = 1" +
        " where OrganizationID = ? and RepresentativeIndex = ?")
      .run(organizationID, representativeIndex);

    db.close();

    return true;
  },

  /*
   * LICENCES
   */

  getLicences: function(reqBody_or_paramsObj, includeOrganization, useLimit) {
    "use strict";

    if (reqBody_or_paramsObj.organizationName && reqBody_or_paramsObj.organizationName !== "") {
      includeOrganization = true;
    }

    const db = sqlite(dbPath, {
      readonly: true
    });

    let params = [];

    let sql = "select l.LicenceID, l.OrganizationID," +
      (includeOrganization ?
        " o.OrganizationName," :
        "") +
      " l.ApplicationDate, l.LicenceTypeKey," +
      " l.StartDate, l.StartTime, l.EndDate, l.EndTime," +
      " l.Location, l.Municipality, l.LicenceDetails, l.TermsConditions," +
      " l.ExternalLicenceNumber, l.LicenceFeeIsPaid" +
      " from LotteryLicences l" +
      (includeOrganization ?
        " left join Organizations o on l.OrganizationID = o.OrganizationID" :
        ""
      ) +
      " where l.RecordDelete_TimeMillis is null";

    if (reqBody_or_paramsObj.organizationID && reqBody_or_paramsObj.organizationID !== "") {
      sql += " and l.OrganizationID = ?";
      params.push(reqBody_or_paramsObj.organizationID);
    }

    if (reqBody_or_paramsObj.organizationName && reqBody_or_paramsObj.organizationName !== "") {
      sql += " and o.OrganizationName = ?";
      params.push(reqBody_or_paramsObj.organizationName);
    }

    if (reqBody_or_paramsObj.licenceTypeKey && reqBody_or_paramsObj.licenceTypeKey !== "") {
      sql += " and l.LicenceTypeKey = ?";
      params.push(reqBody_or_paramsObj.licenceTypeKey);
    }

    if (reqBody_or_paramsObj.licenceStatus) {
      if (reqBody_or_paramsObj.licenceStatus === "past") {
        sql += " and l.EndDate < ?";
        params.push(dateTimeFns.dateToInteger(new Date()));
      } else if (reqBody_or_paramsObj.licenceStatus === "active") {
        sql += " and l.EndDate >= ?";
        params.push(dateTimeFns.dateToInteger(new Date()));
      }
    }

    sql += " order by l.EndDate desc, l.StartDate desc, l.LicenceID";

    if (useLimit) {
      sql += " limit 100";
    }

    let rows = db.prepare(sql).all(params);

    for (let index = 0; index < rows.length; index += 1) {
      const licenceObj = rows[index];

      licenceObj.ApplicationDateString = dateTimeFns.dateIntegerToString(licenceObj.ApplicationDate || 0);

      licenceObj.StartDateString = dateTimeFns.dateIntegerToString(licenceObj.StartDate || 0);
      licenceObj.EndDateString = dateTimeFns.dateIntegerToString(licenceObj.EndDate || 0);

      licenceObj.StartTimeString = dateTimeFns.timeIntegerToString(licenceObj.StartTime || 0);
      licenceObj.EndTimeString = dateTimeFns.timeIntegerToString(licenceObj.EndTime || 0);
    }

    db.close();

    return rows;
  },

  getLicence: function(licenceID) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const licenceObj = db.prepare("select * from LotteryLicences" +
        " where RecordDelete_TimeMillis is null" +
        " and LicenceID = ?")
      .get(licenceID);

    if (licenceObj) {

      licenceObj.ApplicationDateString = dateTimeFns.dateIntegerToString(licenceObj.ApplicationDate || 0);

      licenceObj.StartDateString = dateTimeFns.dateIntegerToString(licenceObj.StartDate || 0);
      licenceObj.EndDateString = dateTimeFns.dateIntegerToString(licenceObj.EndDate || 0);

      licenceObj.StartTimeString = dateTimeFns.timeIntegerToString(licenceObj.StartTime || 0);
      licenceObj.EndTimeString = dateTimeFns.timeIntegerToString(licenceObj.EndTime || 0);


      const fieldList = db.prepare("select * from LotteryLicenceFields" +
          " where LicenceID = ?")
        .all(licenceID);

      licenceObj.licenceFields = fieldList;


      const eventList = db.prepare("select * from LotteryEvents" +
          " where LicenceID = ?" +
          " and RecordDelete_TimeMillis is null" +
          " order by EventDate")
        .all(licenceID);

      for (let eventIndex = 0; eventIndex < eventList.length; eventIndex += 1) {
        const eventObj = eventList[eventIndex];
        eventObj.EventDateString = dateTimeFns.dateIntegerToString(eventObj.EventDate);
      }

      licenceObj.events = eventList;

    }

    db.close();

    return licenceObj;
  },

  getNextExternalLicenceNumberFromRange: function() {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    let rangeStart = parseInt(getApplicationSetting(db, "licences.externalLicenceNumber.range.start") || "-1");

    let rangeEnd = parseInt(getApplicationSetting(db, "licences.externalLicenceNumber.range.end") || "0");

    let row = db.prepare("select max(ExternalLicenceNumberInteger) as MaxExternalLicenceNumberInteger" +
        " from LotteryLicences" +
        " where ExternalLicenceNumberInteger >= ?" +
        " and ExternalLicenceNumberInteger <= ?")
      .get(rangeStart, rangeEnd);

    db.close();

    if (!row) {
      return rangeStart;
    }

    let maxExternalLicenceNumber = row.MaxExternalLicenceNumberInteger;

    if (!maxExternalLicenceNumber) {
      return rangeStart;
    }

    let newExternalLicenceNumber = maxExternalLicenceNumber + 1;

    if (newExternalLicenceNumber > rangeEnd) {
      return -1;
    }

    return newExternalLicenceNumber;
  },

  getDistinctLicenceLocations: function(municipality) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select distinct Location" +
        " from LotteryLicences" +
        " where RecordDelete_TimeMillis is null" +
        " and Municipality = ?" +
        " order by Location")
      .all(municipality);

    db.close();

    let list = new Array(rows.length);

    for (let index = 0; index < rows.length; index += 1) {
      list[index] = rows[index].Location;
    }

    return list;
  },


  createLicence: function(reqBody, reqSession) {
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    let externalLicenceNumberInteger = -1;

    try {
      externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber);
    } catch (e) {
      externalLicenceNumberInteger = -1;
    }

    const info = db.prepare("insert into LotteryLicences (" +
        "OrganizationID, ApplicationDate, LicenceTypeKey," +
        " StartDate, EndDate, StartTime, EndTime," +
        " Location, Municipality, LicenceDetails, TermsConditions, TotalPrizeValue," +
        " ExternalLicenceNumber, ExternalLicenceNumberInteger," +
        " RecordCreate_UserName, RecordCreate_TimeMillis," +
        " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(
        reqBody.organizationID,
        dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
        reqBody.licenceTypeKey,
        dateTimeFns.dateStringToInteger(reqBody.startDateString),
        dateTimeFns.dateStringToInteger(reqBody.endDateString),
        dateTimeFns.timeStringToInteger(reqBody.startTimeString),
        dateTimeFns.timeStringToInteger(reqBody.endTimeString),
        reqBody.location,
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

      db.prepare("insert into LotteryLicenceFields" +
          " (LicenceID, FieldKey, FieldValue)" +
          " values (?, ?, ?)")
        .run(licenceID, fieldKeys[fieldIndex], reqBody[fieldKeys[fieldIndex]]);
    }


    // events

    if (reqBody.eventDate.constructor === String) {

      db.prepare("insert or ignore into LotteryEvents (" +
          "LicenceID, EventDate," +
          " RecordCreate_UserName, RecordCreate_TimeMillis," +
          " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
          " values (?, ?, ?, ?, ?, ?)")
        .run(
          licenceID,
          dateTimeFns.dateStringToInteger(reqBody.eventDate),
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis);

    } else {
      for (let eventIndex = 0; eventIndex < reqBody.eventDate.length; eventIndex += 1) {

        db.prepare("insert or ignore into LotteryEvents (" +
            "LicenceID, EventDate," +
            " RecordCreate_UserName, RecordCreate_TimeMillis," +
            " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
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
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    let externalLicenceNumberInteger = -1;

    try {
      externalLicenceNumberInteger = parseInt(reqBody.externalLicenceNumber);
    } catch (e) {
      externalLicenceNumberInteger = -1;
    }

    const info = db.prepare("update LotteryLicences" +
        " set OrganizationID = ?," +
        " ApplicationDate = ?," +
        " LicenceTypeKey = ?," +
        " StartDate = ?," +
        " EndDate = ?," +
        " StartTime = ?," +
        " EndTime = ?," +
        " Location = ?," +
        " Municipality = ?," +
        " LicenceDetails = ?," +
        " TermsConditions = ?," +
        " TotalPrizeValue = ?," +
        " ExternalLicenceNumber = ?," +
        " ExternalLicenceNumberInteger = ?," +
        " RecordUpdate_UserName = ?," +
        " RecordUpdate_TimeMillis = ?" +
        " where LicenceID = ?" +
        " and RecordDelete_TimeMillis is null")
      .run(
        reqBody.organizationID,
        dateTimeFns.dateStringToInteger(reqBody.applicationDateString),
        reqBody.licenceTypeKey,
        dateTimeFns.dateStringToInteger(reqBody.startDateString),
        dateTimeFns.dateStringToInteger(reqBody.endDateString),
        dateTimeFns.timeStringToInteger(reqBody.startTimeString),
        dateTimeFns.timeStringToInteger(reqBody.endTimeString),
        reqBody.location,
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

    // fields

    db.prepare("delete from LotteryLicenceFields" +
        " where LicenceID = ?")
      .run(reqBody.licenceID);

    const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

    for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

      db.prepare("insert into LotteryLicenceFields" +
          " (LicenceID, FieldKey, FieldValue)" +
          " values (?, ?, ?)")
        .run(reqBody.licenceID, fieldKeys[fieldIndex], reqBody[fieldKeys[fieldIndex]]);
    }


    // events

    if (reqBody.eventDate.constructor === String) {

      db.prepare("insert or ignore into LotteryEvents (" +
          "LicenceID, EventDate," +
          " RecordCreate_UserName, RecordCreate_TimeMillis," +
          " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
          " values (?, ?, ?, ?, ?, ?)")
        .run(
          reqBody.licenceID,
          dateTimeFns.dateStringToInteger(reqBody.eventDate),
          reqSession.user.userName,
          nowMillis,
          reqSession.user.userName,
          nowMillis);

    } else {
      for (let eventIndex = 0; eventIndex < reqBody.eventDate.length; eventIndex += 1) {

        db.prepare("insert or ignore into LotteryEvents (" +
            "LicenceID, EventDate," +
            " RecordCreate_UserName, RecordCreate_TimeMillis," +
            " RecordUpdate_UserName, RecordUpdate_TimeMillis)" +
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
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update LotteryLicences" +
        " set RecordDelete_UserName = ?," +
        " RecordDelete_TimeMillis = ?" +
        " where LicenceID = ?" +
        " and RecordDelete_TimeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        licenceID
      );

    db.close();

    return info.changes;
  },

  markLicenceFeePaid: function(reqBody, reqSession) {
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update LotteryLicences" +
        " set LicenceFee = ?," +
        " ExternalReceiptNumber = ?," +
        " LicenceFeeIsPaid = 1," +
        " RecordUpdate_UserName = ?," +
        " RecordUpdate_TimeMillis = ?" +
        " where LicenceID = ?" +
        " and RecordDelete_TimeMillis is null" +
        " and LicenceFeeIsPaid = 0")
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
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update LotteryLicences" +
        " set LicenceFee = null," +
        " ExternalReceiptNumber = null," +
        " LicenceFeeIsPaid = 0," +
        " RecordUpdate_UserName = ?," +
        " RecordUpdate_TimeMillis = ?" +
        " where LicenceID = ?" +
        " and RecordDelete_TimeMillis is null" +
        " and LicenceFeeIsPaid = 1")
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

  getEvents: function(year, month) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    let rows = db.prepare("select e.EventDate," +
        " l.LicenceID, l.ExternalLicenceNumber, l.LicenceTypeKey, l.LicenceDetails, l.Location," +
        " l.StartTime, l.EndTime," +
        " o.OrganizationName" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.LicenceID = l.LicenceID" +
        " left join Organizations o on l.OrganizationID = o.OrganizationID" +
        " where e.RecordDelete_TimeMillis is null" +
        " and l.RecordDelete_TimeMillis is null" +
        " and o.RecordDelete_TimeMillis is null" +
        " and e.EventDate > ((? * 10000) + (? * 100))" +
        " and e.EventDate < ((? * 10000) + (? * 100) + 99)" +
        " order by e.EventDate, l.StartTime")
      .all(year, month, year, month);

    db.close();

    for (let eventIndex = 0; eventIndex < rows.length; eventIndex += 1) {
      const eventObj = rows[eventIndex];

      eventObj.EventDateString = dateTimeFns.dateIntegerToString(eventObj.EventDate);

      eventObj.StartTimeString = dateTimeFns.timeIntegerToString(eventObj.StartTime || 0);
      eventObj.EndTimeString = dateTimeFns.timeIntegerToString(eventObj.EndTime || 0);
    }

    return rows;
  },

  getEvent: function(licenceID, eventDate) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const eventObj = db.prepare("select * from LotteryEvents" +
        " where RecordDelete_TimeMillis is null" +
        " and LicenceID = ?" +
        " and EventDate = ?")
      .get(licenceID, eventDate);

    db.close();

    return eventObj;
  },

  /*
   * APPLICATION SETTINGS
   */

  getApplicationSettings: function() {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select * from ApplicationSettings").all();

    db.close();

    return rows;
  },

  getApplicationSetting: function(settingKey) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const settingValue = getApplicationSetting(db, settingKey);

    db.close();

    return settingValue;
  },

  updateApplicationSetting: function(settingKey, settingValue, reqSession) {
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update ApplicationSettings" +
        " set SettingValue = ?," +
        " RecordUpdate_UserName = ?," +
        " RecordUpdate_TimeMillis = ?" +
        " where SettingKey = ?")
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


module.exports = licencesDB;
