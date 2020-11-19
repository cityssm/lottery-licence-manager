import * as sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths";

import type * as expressSession from "express-session";


export const deleteOrganizationBankRecord =
  (organizationID: number, recordIndex: number, reqSession: expressSession.Session) => {

    const db = sqlite(dbPath);

    const nowMillis = Date.now();

    const info = db.prepare("update OrganizationBankRecords" +
      " set recordDelete_userName = ?," +
      " recordDelete_timeMillis = ?" +
      " where organizationID = ?" +
      " and recordIndex = ?" +
      " and recordDelete_timeMillis is null")
      .run(
        reqSession.user.userName,
        nowMillis,
        organizationID,
        recordIndex
      );

    db.close();

    return info.changes > 0;
  };
