import { runSQLByName } from "../_runSQLByName.js";
export const updateUser = (reqBody) => {
    return runSQLByName("usersDB", "update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1", [
        reqBody.firstName,
        reqBody.lastName,
        reqBody.userName
    ]).changes;
};
