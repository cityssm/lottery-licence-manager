"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updatePasswordWithDB = void 0;
const _runSQLByName_1 = require("../_runSQLByName");
const bcrypt = require("bcrypt");
const userFns = require("../../helpers/userFns");
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const encryptionRounds = 10;
const updatePasswordWithDB = async (db, userName, passwordPlain) => {
    const hash = await bcrypt.hash(userFns.getHashString(userName, passwordPlain), encryptionRounds);
    _runSQLByName_1.runSQLWithDB(db, "update Users" +
        " set passwordHash = ?" +
        " where userName = ?", [hash, userName]);
};
exports.updatePasswordWithDB = updatePasswordWithDB;
const updatePassword = async (userName, passwordPlain) => {
    const db = sqlite(databasePaths_1.usersDB);
    await exports.updatePasswordWithDB(db, userName, passwordPlain);
    db.close();
};
exports.updatePassword = updatePassword;
