import type { Request, Response } from "express";
import type * as llm from "../helpers/llmTypes";


export const userIsAdmin = (req: Request) => {

  const user = <llm.User>req.session.user;

  if (!user) {
    return false;
  }

  return user.userProperties.isAdmin;
};


export const userCanUpdate = (req: Request) => {

  const user = <llm.User>req.session.user;

  if (!user) {
    return false;
  }

  return user.userProperties.canUpdate;
};


export const userCanCreate = (req: Request) => {

  const user = <llm.User>req.session.user;

  if (!user) {
    return false;
  }

  return user.userProperties.canCreate;
};


export const forbiddenJSON = (res: Response) => {
  return res
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};
