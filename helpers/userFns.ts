import type { Request, Response } from "express";
import type * as llm from "../types/recordTypes";


export const userIsAdmin = (req: Request) => {

  const user = req.session?.user as llm.User;

  if (!user) {
    return false;
  }

  return user.userProperties.isAdmin;
};


export const userCanUpdate = (req: Request) => {

  const user = req.session?.user as llm.User;

  if (!user) {
    return false;
  }

  return user.userProperties.canUpdate;
};


export const userCanCreate = (req: Request) => {

  const user = req.session?.user as llm.User;

  if (!user) {
    return false;
  }

  return user.userProperties.canCreate;
};


export const getHashString = (userName: string, passwordPlain: string) => {
  return userName + "::" + passwordPlain;
};


export const forbiddenJSON = (res: Response) => {
  return res
    .status(403)
    .json({
      success: false,
      message: "Forbidden"
    });
};
