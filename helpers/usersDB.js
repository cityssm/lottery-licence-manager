"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inactivateUser = exports.generateNewPassword = exports.updateUserProperty = exports.updateUser = exports.createUser = exports.getUserProperties = exports.getAllUsers = exports.tryResetPassword = exports.getUser = void 0;
const dbPath = "data/users.db";
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const bcrypt = __importStar(require("bcrypt"));
const stringFns = __importStar(require("@cityssm/expressjs-server-js/stringFns"));
const configFns = __importStar(require("./configFns"));
function getUser(userNameSubmitted, passwordPlain) {
    const db = better_sqlite3_1.default(dbPath);
    const row = db.prepare("select userName, passwordHash, isActive" +
        " from Users" +
        " where userName = ?")
        .get(userNameSubmitted);
    if (!row) {
        db.close();
        if (userNameSubmitted === "admin") {
            const adminPasswordPlain = configFns.getProperty("admin.defaultPassword");
            if (adminPasswordPlain === "") {
                return null;
            }
            if (adminPasswordPlain === passwordPlain) {
                const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
                userProperties.isAdmin = true;
                userProperties.isDefaultAdmin = true;
                return {
                    userName: userNameSubmitted,
                    userProperties: userProperties
                };
            }
        }
        return null;
    }
    else if (row.isActive === 0) {
        db.close();
        return null;
    }
    const databaseUserName = row.userName;
    let passwordIsValid = false;
    if (bcrypt.compareSync(databaseUserName + "::" + passwordPlain, row.passwordHash)) {
        passwordIsValid = true;
    }
    if (!passwordIsValid) {
        db.close();
        return null;
    }
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    userProperties.isDefaultAdmin = false;
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(databaseUserName);
    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
        const propertyName = userPropertyRows[userPropertyIndex].propertyName;
        const propertyValue = userPropertyRows[userPropertyIndex].propertyValue;
        switch (propertyName) {
            case "canCreate":
            case "canUpdate":
            case "isAdmin":
                userProperties[propertyName] = (propertyValue === "true");
                break;
            default:
                userProperties[propertyName] = propertyValue;
                break;
        }
    }
    db.close();
    return {
        userName: databaseUserName,
        userProperties: userProperties
    };
}
exports.getUser = getUser;
function tryResetPassword(userName, oldPasswordPlain, newPasswordPlain) {
    const db = better_sqlite3_1.default(dbPath);
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
    const oldPasswordMatches = bcrypt.compareSync(userName + "::" + oldPasswordPlain, row.passwordHash);
    if (!oldPasswordMatches) {
        db.close();
        return {
            success: false,
            message: "Old password does not match."
        };
    }
    const newPasswordHash = bcrypt.hashSync(userName + "::" + newPasswordPlain, 10);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(newPasswordHash, userName);
    db.close();
    return {
        success: true,
        message: "Password updated successfully."
    };
}
exports.tryResetPassword = tryResetPassword;
function getAllUsers() {
    const db = better_sqlite3_1.default(dbPath, {
        readonly: true
    });
    const rows = db.prepare("select userName, firstName, lastName" +
        " from Users" +
        " where isActive = 1" +
        " order by userName")
        .all();
    db.close();
    return rows;
}
exports.getAllUsers = getAllUsers;
function getUserProperties(userName) {
    const db = better_sqlite3_1.default(dbPath, {
        readonly: true
    });
    const userProperties = Object.assign({}, configFns.getProperty("user.defaultProperties"));
    const userPropertyRows = db.prepare("select propertyName, propertyValue" +
        " from UserProperties" +
        " where userName = ?")
        .all(userName);
    for (let userPropertyIndex = 0; userPropertyIndex < userPropertyRows.length; userPropertyIndex += 1) {
        userProperties[userPropertyRows[userPropertyIndex].propertyName] =
            userPropertyRows[userPropertyIndex].propertyValue;
    }
    db.close();
    return userProperties;
}
exports.getUserProperties = getUserProperties;
function createUser(reqBody) {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(reqBody.userName + "::" + newPasswordPlain, 10);
    const db = better_sqlite3_1.default(dbPath);
    const row = db.prepare("select isActive" +
        " from Users" +
        " where userName = ?")
        .get(reqBody.userName);
    if (row) {
        if (row.isActive) {
            db.close();
            return false;
        }
        db.prepare("update Users" +
            " set firstName = ?," +
            " lastName = ?," +
            " passwordHash = ?," +
            " isActive = 1" +
            " where userName = ?")
            .run(reqBody.firstName, reqBody.lastName, hash, reqBody.userName);
        db.prepare("delete from UserProperties" +
            " where userName = ?")
            .run(reqBody.userName);
    }
    else {
        db.prepare("insert into Users" +
            " (userName, firstName, lastName, isActive, passwordHash)" +
            " values (?, ?, ?, 1, ?)")
            .run(reqBody.userName, reqBody.firstName, reqBody.lastName, hash);
    }
    return newPasswordPlain;
}
exports.createUser = createUser;
function updateUser(reqBody) {
    const db = better_sqlite3_1.default(dbPath);
    const info = db.prepare("update Users" +
        " set firstName = ?," +
        " lastName = ?" +
        " where userName = ?" +
        " and isActive = 1")
        .run(reqBody.firstName, reqBody.lastName, reqBody.userName);
    db.close();
    return info.changes;
}
exports.updateUser = updateUser;
function updateUserProperty(reqBody) {
    const db = better_sqlite3_1.default(dbPath);
    let info;
    if (reqBody.propertyValue === "") {
        info = db.prepare("delete from UserProperties" +
            " where userName = ?" +
            " and propertyName = ?")
            .run(reqBody.userName, reqBody.propertyName);
    }
    else {
        info = db.prepare("replace into UserProperties" +
            " (userName, propertyName, propertyValue)" +
            " values (?, ?, ?)")
            .run(reqBody.userName, reqBody.propertyName, reqBody.propertyValue);
    }
    db.close();
    return info.changes;
}
exports.updateUserProperty = updateUserProperty;
function generateNewPassword(userName) {
    const newPasswordPlain = stringFns.generatePassword();
    const hash = bcrypt.hashSync(userName + "::" + newPasswordPlain, 10);
    const db = better_sqlite3_1.default(dbPath);
    db.prepare("update Users" +
        " set passwordHash = ?" +
        " where userName = ?")
        .run(hash, userName);
    db.close();
    return newPasswordPlain;
}
exports.generateNewPassword = generateNewPassword;
function inactivateUser(userName) {
    const db = better_sqlite3_1.default(dbPath);
    const info = db.prepare("update Users" +
        " set isActive = 0" +
        " where userName = ?" +
        " and isActive = 1")
        .run(userName);
    db.close();
    return info.changes;
}
exports.inactivateUser = inactivateUser;
