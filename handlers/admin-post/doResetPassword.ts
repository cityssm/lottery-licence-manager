import type { RequestHandler } from "express";

import { generateNewPassword } from "../../helpers/usersDB/generateNewPassword";


export const handler: RequestHandler = async(req, res) => {

  const newPassword = await generateNewPassword(req.body.userName);

  res.json({
    success: true,
    newPassword
  });
};
