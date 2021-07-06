import sqlite from "better-sqlite3";
import { usersDB as databasePath } from "../../data/databasePaths.js";

import { updatePasswordWithDB } from "./updatePassword.js";

import * as userFns from "../../helpers/userFns.js";

import * as bcrypt from "bcrypt";


interface TryResetPasswordReturn {
    success: boolean;
    message: string;
}


export const tryResetPassword = async(userName: string, oldPasswordPlain: string, newPasswordPlain: string): Promise<TryResetPasswordReturn> => {

  const database = sqlite(databasePath);

  const row = database.prepare("select passwordHash from Users" +
    " where userName = ?" +
    " and isActive = 1")
    .get(userName);

  if (!row) {

    database.close();

    return {
      success: false,
      message: "User record not found."
    };
  }

  const oldPasswordMatches = await bcrypt.compare(userFns.getHashString(userName, oldPasswordPlain), row.passwordHash);

  if (!oldPasswordMatches) {

    database.close();

    return {
      success: false,
      message: "Old password does not match."
    };
  }

  await updatePasswordWithDB(database, userName, newPasswordPlain);

  database.close();

  return {
    success: true,
    message: "Password updated successfully."
  };
};
