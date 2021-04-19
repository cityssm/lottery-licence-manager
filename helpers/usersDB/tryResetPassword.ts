import sqlite from "better-sqlite3";
import { usersDB as dbPath } from "../../data/databasePaths.js";

import { updatePasswordWithDB } from "./updatePassword.js";

import * as userFns from "../../helpers/userFns.js";

import * as bcrypt from "bcrypt";


export const tryResetPassword = async(userName: string, oldPasswordPlain: string, newPasswordPlain: string) => {

  const db = sqlite(dbPath);

  const row = db.prepare("select passwordHash from Users" +
    " where userName = ?" +
    " and isActive = 1")
    .get(userName);

  if (!row) {

    db.close();

    return {
      success: false,
      message: "User record not found."
    };
  }

  const oldPasswordMatches = await bcrypt.compare(userFns.getHashString(userName, oldPasswordPlain), row.passwordHash);

  if (!oldPasswordMatches) {

    db.close();

    return {
      success: false,
      message: "Old password does not match."
    };
  }

  await updatePasswordWithDB(db, userName, newPasswordPlain);

  db.close();

  return {
    success: true,
    message: "Password updated successfully."
  };
};
