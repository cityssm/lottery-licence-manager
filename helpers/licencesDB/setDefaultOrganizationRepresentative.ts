import sqlite from "better-sqlite3";

import { licencesDB as dbPath } from "../../data/databasePaths.js";


export const setDefaultOrganizationRepresentative = (organizationID: number, representativeIndex: number) => {

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
};
