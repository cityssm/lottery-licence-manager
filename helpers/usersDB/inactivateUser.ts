import { runSQLByName } from "../_runSQLByName";


export const inactivateUser = (userName: string) => {

  return runSQLByName("usersDB",
    "update Users" +
    " set isActive = 0" +
    " where userName = ?" +
    " and isActive = 1",
    [userName])
    .changes;
};
