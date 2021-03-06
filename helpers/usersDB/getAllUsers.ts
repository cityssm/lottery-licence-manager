import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";

import type { User } from "../../types/recordTypes";


export const getAllUsers = (): User[] => {

  const database = sqlite(databasePath, {
    readonly: true
  });

  const rows: User[] =
    database.prepare("select userName, firstName, lastName" +
      " from Users" +
      " where isActive = 1" +
      " order by userName")
      .all();

  database.close();

  return rows;
};
