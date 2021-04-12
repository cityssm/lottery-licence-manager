import { runSQLByName } from "../_runSQLByName";

import * as userFns from "../../helpers/userFns";

import * as bcrypt from "bcrypt";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns";


export const generateNewPassword = (userName: string) => {

  const newPasswordPlain: string = stringFns.generatePassword();
  const hash = bcrypt.hashSync(userFns.getHashString(userName, newPasswordPlain), 10);

  runSQLByName("usersDB",
    "update Users" +
    " set passwordHash = ?" +
    " where userName = ?",
    [hash, userName]);

  return newPasswordPlain;
};
