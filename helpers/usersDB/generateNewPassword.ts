import { updatePassword } from "./updatePassword.js";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns.js";


export const generateNewPassword = async(userName: string) => {

  const newPasswordPlain: string = stringFns.generatePassword();

  await updatePassword(userName, newPasswordPlain);

  return newPasswordPlain;
};
