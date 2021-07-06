import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";

import type * as llm from "../../types/recordTypes";


export const getDeletedOrganizations = (): llm.Organization[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const organizations: llm.Organization[] =
    database.prepare("select organizationID, organizationName," +
      " recordDelete_timeMillis, recordDelete_userName" +
      " from Organizations" +
      " where recordDelete_timeMillis is not null" +
      " order by organizationName, recordDelete_timeMillis desc")
      .all();

  database.close();

  for (const organization of organizations) {
    organization.recordDelete_dateString = dateTimeFns.dateToString(new Date(organization.recordDelete_timeMillis));
  }

  return organizations;
};
