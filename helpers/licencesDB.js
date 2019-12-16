/* global require, module */


const configFns = require("./configFns");

const dateTimeFns = require("./dateTimeFns");

const sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";


function getApplicationSetting(db, settingKey) {
  "use strict";

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
  "use strict";

  // check user permissions

  let canUpdate = false;

  if (!reqSession) {
    canUpdate = false;

  } else if (reqSession.user.userProperties.canUpdate === "true") {
    canUpdate = true;

  } else if (reqSession.user.userProperties.canCreate === "true" &&
    obj.recordCreate_userName === reqSession.user.userName &&
    obj.recordUpdate_userName === reqSession.user.userName ||
    obj.recordUpdate_timeMillis + configFns.getProperty("user.createUpdateWindowMillis") > Date.now()) {

    canUpdate = true;
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
    }
  }

  return canUpdate;
}


let licencesDB = {

  getRawRowsColumns: function(sql, params) {
    "use strict";

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
   * ORGANIZATIONS
   */

  getOrganizations: function(reqBody, useLimit, reqSession) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    let params = [
      dateTimeFns.dateToInteger(new Date())
    ];

    let sql = "select o.organizationID, o.organizationName, o.isEligibleForLicences," +
      " sum(case when l.endDate >= ? then 1 else 0 end) as licences_activeCount," +
      " max(l.endDate) as licences_endDateMax," +
      " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
      " from Organizations o" +
      " left join LotteryLicences l on o.organizationID = l.organizationID and l.recordDelete_timeMillis is null" +
      " where o.recordDelete_TimeMillis is null";

    if (reqBody.organizationName && reqBody.organizationName !== "") {
      sql += " and instr(lower(o.organizationName), ?)";
      params.push(reqBody.organizationName.toLowerCase());
    }

    if (reqBody.representativeName && reqBody.representativeName !== "") {
      sql += " and o.organizationID in (select organizationID from OrganizationRepresentatives where instr(lower(representativeName), ?))";
      params.push(reqBody.representativeName.toLowerCase());
    }

    sql += " group by o.organizationID, o.organizationName," +
      " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
      " order by o.organizationName, o.organizationID";

    if (useLimit) {
      sql += " limit 100";
    }

    let rows = db.prepare(sql).all(params);

    db.close();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      rows[rowIndex].canUpdate = canUpdateObject("organization", rows[rowIndex], reqSession);
      rows[rowIndex].licences_endDateMaxString = dateTimeFns.dateIntegerToString(rows[rowIndex].licences_endDateMax || 0);
    }

    return rows;
  },

  getOrganization: function(organizationID, reqSession) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const organizationObj = db.prepare("select * from Organizations" +
        " where recordDelete_TimeMillis is null" +
        " and organizationID = ?")
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
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("insert into Organizations (" +
        "organizationName, organizationAddress1, organizationAddress2," +
        " organizationCity, organizationProvince, organizationPostalCode," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_UserName, recordUpdate_timeMillis)" +
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


  addOrganizationRepresentative: function(organizationID, reqBody) {
    "use strict";

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
        " representativePhoneNumber," +
        " isDefault)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(organizationID, newRepresentativeIndex,
        reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
        reqBody.representativePhoneNumber,
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
      isDefault: newIsDefault
    };
  },

  updateOrganizationRepresentative: function(organizationID, reqBody) {
    "use strict";

    const db = sqlite(dbPath);

    db.prepare("update OrganizationRepresentatives" +
        " set representativeName = ?," +
        " representativeTitle = ?," +
        " representativeAddress1 = ?," +
        " representativeAddress2 = ?," +
        " representativeCity = ?," +
        " representativeProvince = ?," +
        " representativePostalCode = ?," +
        " representativePhoneNumber = ?" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
      .run(reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
        reqBody.representativePhoneNumber,
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
      isDefault: reqBody.isDefault
    };
  },

  deleteOrganizationRepresentative: function(organizationID, representativeIndex) {

    "use strict";

    const db = sqlite(dbPath);

    db
      .prepare("delete from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
      .run(organizationID, representativeIndex);

    db.close();

    return true;
  },

  setDefaultOrganizationRepresentative: function(organizationID, representativeIndex) {
    "use strict";

    const db = sqlite(dbPath);

    db
      .prepare("update OrganizationRepresentatives" +
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
   * LICENCES
   */

  getLicences: function(reqBody_or_paramsObj, includeOrganization, useLimit, reqSession) {
    "use strict";

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
      " l.location, l.municipality, l.licenceDetails, l.termsConditions," +
      " l.externalLicenceNumber, l.licenceFeeIsPaid," +
      " l.recordCreate_userName, l.recordCreate_timeMillis, l.recordUpdate_userName, l.recordUpdate_timeMillis" +
      " from LotteryLicences l" +
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
      sql += " and instr(lower(o.organizationName), ?)";
      params.push(reqBody_or_paramsObj.organizationName.toLowerCase());
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

      licenceObj.canUpdate = canUpdateObject("licence", licenceObj, reqSession);
    }

    db.close();

    return rows;
  },

  getLicence: function(licenceID, reqSession) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const licenceObj = db.prepare("select * from LotteryLicences" +
        " where recordDelete_timeMillis is null" +
        " and licenceID = ?")
      .get(licenceID);

    if (licenceObj) {

      licenceObj.applicationDateString = dateTimeFns.dateIntegerToString(licenceObj.applicationDate || 0);

      licenceObj.startDateString = dateTimeFns.dateIntegerToString(licenceObj.startDate || 0);
      licenceObj.endDateString = dateTimeFns.dateIntegerToString(licenceObj.endDate || 0);

      licenceObj.startTimeString = dateTimeFns.timeIntegerToString(licenceObj.startTime || 0);
      licenceObj.endTimeString = dateTimeFns.timeIntegerToString(licenceObj.endTime || 0);

      licenceObj.canUpdate = canUpdateObject("licence", licenceObj, reqSession);


      const fieldList = db.prepare("select * from LotteryLicenceFields" +
          " where licenceID = ?")
        .all(licenceID);

      licenceObj.licenceFields = fieldList;


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

  getDistinctLicenceLocations: function(municipality) {
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    const rows = db.prepare("select distinct location" +
        " from LotteryLicences" +
        " where recordDelete_timeMillis is null" +
        " and municipality = ?" +
        " order by location")
      .all(municipality);

    db.close();

    let list = new Array(rows.length);

    for (let index = 0; index < rows.length; index += 1) {
      list[index] = rows[index].location;
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
        "organizationID, applicationDate, licenceTypeKey," +
        " startDate, endDate, startTime, endTime," +
        " location, municipality, licenceDetails, termsConditions, totalPrizeValue," +
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

      const fieldKey = fieldKeys[fieldIndex];
      const fieldValue = reqBody[fieldKey];

      if (fieldValue !== "") {
        db.prepare("insert into LotteryLicenceFields" +
            " (licenceID, fieldKey, fieldValue)" +
            " values (?, ?, ?)")
          .run(licenceID, fieldKey, fieldValue);
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
        " set organizationID = ?," +
        " applicationDate = ?," +
        " licenceTypeKey = ?," +
        " startDate = ?," +
        " endDate = ?," +
        " startTime = ?," +
        " endTime = ?," +
        " location = ?," +
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
        " where licenceID = ?")
      .run(reqBody.licenceID);

    const fieldKeys = reqBody.fieldKeys.substring(1).split(",");

    for (let fieldIndex = 0; fieldIndex < fieldKeys.length; fieldIndex += 1) {

      const fieldKey = fieldKeys[fieldIndex];
      const fieldValue = reqBody[fieldKey];

      if (fieldValue !== "") {
        db.prepare("insert into LotteryLicenceFields" +
            " (licenceID, fieldKey, fieldValue)" +
            " values (?, ?, ?)")
          .run(reqBody.licenceID, fieldKey, fieldValue);
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
    "use strict";

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

  markLicenceFeePaid: function(reqBody, reqSession) {
    "use strict";

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update LotteryLicences" +
        " set licenceFee = ?," +
        " externalReceiptNumber = ?," +
        " licenceFeeIsPaid = 1," +
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
    "use strict";

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
    "use strict";

    const db = sqlite(dbPath, {
      readonly: true
    });

    let rows = db.prepare("select e.eventDate," +
        " l.licenceID, l.externalLicenceNumber, l.licenceTypeKey, l.licenceDetails, l.location," +
        " l.startTime, l.endTime," +
        " o.organizationName," +
        " e.recordCreate_userName, e.recordCreate_timeMillis, e.recordUpdate_userName, e.recordUpdate_timeMillis" +
        " from LotteryEvents e" +
        " left join LotteryLicences l on e.licenceID = l.licenceID" +
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

      eventObj.canUpdate = canUpdateObject("event", eventObj, reqSession);
    }

    return rows;
  },

  getEvent: function(licenceID, eventDate, reqSession) {
    "use strict";

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
    "use strict";

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
    "use strict";

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


module.exports = licencesDB;
