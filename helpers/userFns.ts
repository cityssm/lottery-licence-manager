import type { Request } from "express";


export const userIsAdmin = (req: Request) => {

  const user = req.session?.user;

  if (!user) {
    return false;
  }

  return user.userProperties.isAdmin;
};


export const userCanUpdate = (req: Request) => {

  const user = req.session?.user;

  if (!user) {
    return false;
  }

  return user.userProperties.canUpdate;
};


export const userCanCreate = (req: Request) => {

  const user = req.session?.user;

  if (!user) {
    return false;
  }

  return user.userProperties.canCreate;
};


export const getHashString = (userName: string, passwordPlain: string) => {
  return userName + "::" + passwordPlain;
};
