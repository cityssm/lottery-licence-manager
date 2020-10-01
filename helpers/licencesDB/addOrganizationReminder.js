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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrganizationReminder = exports.addOrganizationReminderWithDB = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const databasePaths_1 = require("../../data/databasePaths");
const dateTimeFns = __importStar(require("@cityssm/expressjs-server-js/dateTimeFns"));
exports.addOrganizationReminderWithDB = (db, reminderData, reqSession) => {
    const row = db.prepare("select ifnull(max(reminderIndex), -1) as maxIndex" +
        " from OrganizationReminders" +
        " where organizationID = ?")
        .get(reminderData.organizationID);
    const newReminderIndex = row.maxIndex + 1;
    const nowMillis = Date.now();
    db.prepare("insert into OrganizationReminders" +
        " (organizationID, reminderIndex, reminderTypeKey, reminderDate," +
        " reminderStatus, reminderNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reminderData.organizationID, newReminderIndex, reminderData.reminderTypeKey, (!reminderData.reminderDateString || reminderData.reminderDateString === ""
        ? null
        : dateTimeFns.dateStringToInteger(reminderData.reminderDateString)), reminderData.reminderStatus, reminderData.reminderNote, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    const reminder = {
        recordType: "reminder",
        canUpdate: true,
        organizationID: parseInt(reminderData.organizationID, 10),
        reminderIndex: newReminderIndex,
        reminderTypeKey: reminderData.reminderTypeKey,
        reminderDate: dateTimeFns.dateStringToInteger(reminderData.reminderDateString),
        reminderDateString: reminderData.reminderDateString,
        dismissedDate: null,
        dismissedDateString: "",
        reminderStatus: reminderData.reminderStatus,
        reminderNote: reminderData.reminderNote,
        recordCreate_userName: reqSession.user.userName,
        recordCreate_timeMillis: nowMillis,
        recordUpdate_userName: reqSession.user.userName,
        recordUpdate_timeMillis: nowMillis
    };
    return reminder;
};
exports.addOrganizationReminder = (reqBody, reqSession) => {
    const db = better_sqlite3_1.default(databasePaths_1.licencesDB);
    const reminder = exports.addOrganizationReminderWithDB(db, reqBody, reqSession);
    db.close();
    return reminder;
};
