import type { RequestHandler } from "express";

import { createUser } from "../../helpers/usersDB/createUser";


export const handler: RequestHandler = (req, res) => {

  const newPassword = createUser(req.body);

  if (!newPassword) {

    res.json({
      success: false,
      message: "New Account Not Created"
    });

  } else {

    res.json({
      success: true,
      newPassword
    });

  }
};
