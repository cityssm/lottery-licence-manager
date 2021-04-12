"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const updateUser = (reqBody) => {
    return _runSQLByName_1.runSQLByName("usersDB", "update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1", [
        reqBody.firstName,
        reqBody.lastName,
        reqBody.userName
    ]).changes;
};
exports.updateUser = updateUser;
