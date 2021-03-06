import type { RequestHandler } from "express";

import { forbiddenJSON } from "../../handlers/permissions.js";

import { inactivateUser } from "../../helpers/usersDB/inactivateUser.js";


export const handler: RequestHandler = (request, response) => {

  const userNameToDelete = request.body.userName;

  if (userNameToDelete === request.session.user.userName) {

    // You can't delete yourself!
    return forbiddenJSON(response);
  }

  const success = inactivateUser(userNameToDelete);

  response.json({
    success
  });
};


export default handler;
