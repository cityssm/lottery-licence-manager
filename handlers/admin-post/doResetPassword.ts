import type { RequestHandler } from "express";

import { generateNewPassword } from "../../helpers/usersDB/generateNewPassword";


export const handler: RequestHandler = (req, res) => {

  const newPassword = generateNewPassword(req.body.userName);

  res.json({
    success: true,
    newPassword
  });
};
