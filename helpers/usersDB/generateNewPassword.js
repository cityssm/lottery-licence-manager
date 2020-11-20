"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewPassword = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const userFns = require("../../helpers/userFns");
const bcrypt = require("bcrypt");
const stringFns = require("@cityssm/expressjs-server-js/stringFns");
const generateNewPassword = (userName) => {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(userFns.getHashString(userName, newPasswordPlain), 10);
    const db = sqlite(databasePaths_1.usersDB);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(hash, userName);
    db.close();
    return newPasswordPlain;
};
exports.generateNewPassword = generateNewPassword;
