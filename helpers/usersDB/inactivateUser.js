import { runSQLByName } from "../_runSQLByName.js";
export const inactivateUser = (userName) => {
    return runSQLByName("usersDB", "update Users" +
        " set isActive = 0" +
        " where userName = ?" +
        " and isActive = 1", [userName])
        .changes > 0;
};
