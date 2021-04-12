import { updatePassword } from "./updatePassword";

import * as stringFns from "@cityssm/expressjs-server-js/stringFns";


export const generateNewPassword = async(userName: string) => {

  const newPasswordPlain: string = stringFns.generatePassword();

  await updatePassword(userName, newPasswordPlain);

  return newPasswordPlain;
};
