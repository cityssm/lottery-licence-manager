import { runSQLWithDB } from "../_runSQLByName.js";

import * as bcrypt from "bcrypt";

import * as userFns from "../../helpers/userFns.js";

import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";


const encryptionRounds = 10;

export const updatePasswordWithDB = async(database: sqlite.Database, userName: string, passwordPlain: string): Promise<void> => {

  const hash = await bcrypt.hash(userFns.getHashString(userName, passwordPlain), encryptionRounds);

  runSQLWithDB(database,
    "update Users" +
    " set passwordHash = ?" +
    " where userName = ?",
    [hash, userName]);
};


export const updatePassword = async(userName: string, passwordPlain: string): Promise<void> => {

  const database = sqlite(databasePath);
  await updatePasswordWithDB(database, userName, passwordPlain);
  database.close();
};
