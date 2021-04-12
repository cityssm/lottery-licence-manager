"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryResetPassword = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
const updatePassword_1 = require("./updatePassword");
const userFns = require("../../helpers/userFns");
const bcrypt = require("bcrypt");
const tryResetPassword = async (userName, oldPasswordPlain, newPasswordPlain) => {
    const db = sqlite(databasePaths_1.usersDB);
    const row = db.prepare("select passwordHash from Users" +
        " where userName = ?" +
        " and isActive = 1")
        .get(userName);
    if (!row) {
        db.close();
        return {
            success: false,
            message: "User record not found."
        };
    }
    const oldPasswordMatches = bcrypt.compareSync(userFns.getHashString(userName, oldPasswordPlain), row.passwordHash);
    if (!oldPasswordMatches) {
        db.close();
        return {
            success: false,
            message: "Old password does not match."
        };
    }
    await updatePassword_1.updatePasswordWithDB(db, userName, newPasswordPlain);
    db.close();
    return {
        success: true,
        message: "Password updated successfully."
    };
};
exports.tryResetPassword = tryResetPassword;
