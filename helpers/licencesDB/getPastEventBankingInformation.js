"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPastEventBankingInformation = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
;
const getPastEventBankingInformation = (licenceID) => {
    const db = sqlite(databasePaths_1.licencesDB, {
        readonly: true
    });
    const organizationID = db.prepare("select organizationID from LotteryLicences" +
        " where licenceID = ?")
        .get(licenceID)
        .organizationID;
    const cutoffDateInteger = dateTimeFns.dateToInteger(new Date()) - 50000;
    const bankInfoList = db.prepare("select bank_name, bank_address, bank_accountNumber," +
        " max(eventDate) as eventDateMax" +
        " from LotteryEvents" +
        (" where licenceID in (" +
            "select licenceID from LotteryLicences where organizationID = ? and recordDelete_timeMillis is null)") +
        " and licenceID <> ?" +
        " and eventDate >= ?" +
        " and recordDelete_timeMillis is null" +
        " and bank_name is not null and bank_name <> ''" +
        " and bank_address is not null and bank_address <> ''" +
        " and bank_accountNumber is not null and bank_accountNumber <> ''" +
        " group by bank_name, bank_address, bank_accountNumber" +
        " order by max(eventDate) desc")
        .all(organizationID, licenceID, cutoffDateInteger);
    db.close();
    for (const record of bankInfoList) {
        record.eventDateMaxString = dateTimeFns.dateIntegerToString(record.eventDateMax);
    }
    return bankInfoList;
};
exports.getPastEventBankingInformation = getPastEventBankingInformation;
