import type { RequestHandler } from "express";

import { getAllUsers } from "../../helpers/usersDB/getAllUsers.js";


export const handler: RequestHandler = (_req, res) => {

  const users = getAllUsers();

  res.render("admin-userManagement", {
    headTitle: "User Management",
    users
  });
};
