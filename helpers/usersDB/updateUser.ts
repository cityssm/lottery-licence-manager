import { runSQLByName } from "../_runSQLByName.js";


export const updateUser = (requestBody: {
  userName: string;
  lastName: string;
  firstName: string;
}): boolean => {

  return runSQLByName("usersDB",
    "update Users" +
    " set firstName = ?," +
    " lastName = ?" +
    " where userName = ?" +
    " and isActive = 1", [
      requestBody.firstName,
      requestBody.lastName,
      requestBody.userName
    ]).changes > 0;
};
