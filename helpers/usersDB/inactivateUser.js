"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inactivateUser = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const inactivateUser = (userName) => {
    return _runSQLByName_1.runSQLByName("usersDB", "update Users" +
        " set isActive = 0" +
        " where userName = ?" +
        " and isActive = 1", [userName])
        .changes;
};
exports.inactivateUser = inactivateUser;
