import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../../data/databasePaths.js";


export const deleteOrganizationRepresentative = (organizationID: number, representativeIndex: number): boolean => {

  const database = sqlite(databasePath);

  const info = database.prepare("delete from OrganizationRepresentatives" +
    " where organizationID = ?" +
    " and representativeIndex = ?")
    .run(organizationID, representativeIndex);

  database.close();

  return info.changes > 0;
};
