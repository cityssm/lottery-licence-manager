import type { RequestHandler } from "express";

import { updateUserProperty } from "../../helpers/usersDB/updateUserProperty.js";


export const handler: RequestHandler = (request, response) => {

  const success = updateUserProperty(request.body);

  response.json({
    success: success
  });
};


export default handler;
