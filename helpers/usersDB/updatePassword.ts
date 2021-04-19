import { runSQLWithDB } from "../_runSQLByName.js";

import * as bcrypt from "bcrypt";

import * as userFns from "../../helpers/userFns.js";

import sqlite from "better-sqlite3";
import { usersDB as dbPath } from "../../data/databasePaths.js";


const encryptionRounds = 10;

export const updatePasswordWithDB = async(db: sqlite.Database, userName: string, passwordPlain: string) => {

  const hash = await bcrypt.hash(userFns.getHashString(userName, passwordPlain), encryptionRounds);

  runSQLWithDB(db,
    "update Users" +
    " set passwordHash = ?" +
    " where userName = ?",
    [hash, userName]);
};


export const updatePassword = async(userName: string, passwordPlain: string) => {

  const db = sqlite(dbPath);
  await updatePasswordWithDB(db, userName, passwordPlain);
  db.close();
};
