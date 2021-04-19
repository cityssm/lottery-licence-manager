import type { RequestHandler } from "express";

import { forbiddenJSON } from "../../handlers/permissions.js";

import { inactivateUser } from "../../helpers/usersDB/inactivateUser.js";


export const handler: RequestHandler = (req, res) => {

  const userNameToDelete = req.body.userName;

  if (userNameToDelete === req.session.user.userName) {

    // You can't delete yourself!
    return forbiddenJSON(res);
  }

  const success = inactivateUser(userNameToDelete);

  res.json({
    success
  });
};
