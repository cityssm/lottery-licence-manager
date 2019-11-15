/* global require, module */


const sqlite = require("better-sqlite3");
const dbPath = "data/licences.db";


let licencesDB = (function() {

  "use strict";

  return {

    getOrganizations: function(reqBody) {

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

      sql += " limit 100";

      let rows = db.prepare(sql).all(params);

      db.close();

      return rows;
    },

    getOrganization: function(organizationID) {

      const db = sqlite(dbPath, {
        readonly: true
      });

      const row = db.prepare("select * from Organizations" +
          " where RecordDelete_TimeMillis is null" +
          " and OrganizationID = ?")
        .get(organizationID);

      db.close();

      return row;
    },

    createOrganization: function(reqBody, reqSession) {

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
    }
  };
}());


module.exports = licencesDB;
