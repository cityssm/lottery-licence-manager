import { runSQLByName } from "../_runSQLByName";


export const updateUser = (reqBody: {
  userName: string;
  lastName: string;
  firstName: string;
}) => {

  return runSQLByName("usersDB",
    "update Users" +
    " set firstName = ?," +
    " lastName = ?" +
    " where userName = ?" +
    " and isActive = 1", [
      reqBody.firstName,
      reqBody.lastName,
      reqBody.userName
    ]).changes;
};
