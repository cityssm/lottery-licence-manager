import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";

import type * as llm from "../../types/recordTypes";
import type * as expressSession from "express-session";


export const createOrganization = (requestBody: llm.Organization, requestSession: expressSession.Session): number => {

  const database = sqlite(databasePath);

  const nowMillis = Date.now();

  const info = database.prepare("insert into Organizations (" +
    "organizationName, organizationAddress1, organizationAddress2," +
    " organizationCity, organizationProvince, organizationPostalCode," +
    " organizationNote," +
    " recordCreate_userName, recordCreate_timeMillis," +
    " recordUpdate_userName, recordUpdate_timeMillis)" +
    " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      requestBody.organizationName,
      requestBody.organizationAddress1,
      requestBody.organizationAddress2,
      requestBody.organizationCity,
      requestBody.organizationProvince,
      requestBody.organizationPostalCode,
      "",
      requestSession.user.userName,
      nowMillis,
      requestSession.user.userName,
      nowMillis
    );

  database.close();

  return Number(info.lastInsertRowid);
};
