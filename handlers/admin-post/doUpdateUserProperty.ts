import type { RequestHandler } from "express";

import { updateUserProperty } from "../../helpers/usersDB/updateUserProperty";


export const handler: RequestHandler = (req, res) => {

  const changeCount = updateUserProperty(req.body);

  res.json({
    success: (changeCount === 1)
  });
};
