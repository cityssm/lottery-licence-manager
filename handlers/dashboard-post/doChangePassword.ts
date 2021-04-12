import type { RequestHandler } from "express";

import { tryResetPassword } from "../../helpers/usersDB/tryResetPassword";


export const handler: RequestHandler = async(req, res) => {

  const userName = req.session.user.userName;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const result = await tryResetPassword(userName, oldPassword, newPassword);

  res.json(result);
};
