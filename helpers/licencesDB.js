/* global require, module */


const sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";


let licencesDB = {

  getOrganizations: function(reqBody) {
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

    sql += " limit 100";

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
        " IsDefault)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(organizationID, newRepresentativeIndex,
        reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
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
        " RepresentativePostalCode = ?" +
        " where OrganizationID = ?" +
        " and RepresentativeIndex = ?")
      .run(reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
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
  }
};


module.exports = licencesDB;
