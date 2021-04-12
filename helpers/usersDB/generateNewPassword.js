"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewPassword = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const userFns = require("../../helpers/userFns");
const bcrypt = require("bcrypt");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const generateNewPassword = (userName) => {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(userFns.getHashString(userName, newPasswordPlain), 10);
    _runSQLByName_1.runSQLByName("usersDB", "update Users" +
        " set passwordHash = ?" +
        " where userName = ?", [hash, userName]);
    return newPasswordPlain;
};
exports.generateNewPassword = generateNewPassword;
