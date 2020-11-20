import type { RequestHandler } from "express";

import { updateUser } from "../../helpers/usersDB/updateUser";


export const handler: RequestHandler = (req, res) => {

  const changeCount = updateUser(req.body);

  res.json({
    success: (changeCount === 1)
  });
};
