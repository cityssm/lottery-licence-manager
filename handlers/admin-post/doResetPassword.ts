import type { RequestHandler } from "express";

import * as usersDB_generateNewPassword from "../../helpers/usersDB/generateNewPassword";


export const handler: RequestHandler = (req, res) => {

 const newPassword = usersDB_generateNewPassword.generateNewPassword(req.body.userName);

 res.json({
   success: true,
   newPassword
 });
};
