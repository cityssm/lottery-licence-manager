import type { RequestHandler } from "express";

import { getUserProperties } from "../../helpers/usersDB/getUserProperties";


export const handler: RequestHandler = (req, res) => {

  const userProperties = getUserProperties(req.body.userName);

  res.json(userProperties);
};
