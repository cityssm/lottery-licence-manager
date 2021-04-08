import * as sqlite from "better-sqlite3";

import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import { licencesDB as dbPath } from "../../data/databasePaths";

export interface PastEventBankingInformation {
  bank_name: string;
  bank_address: string;
  bank_accountNumber: string;
  eventDateMax: number;
  eventDateMaxString: string;
};

export const getPastEventBankingInformation = (licenceID: number | string) => {

  const db = sqlite(dbPath, {
    readonly: true
  });

  const organizationIDResult = db.prepare("select organizationID from LotteryLicences" +
    " where licenceID = ?")
    .get(licenceID);

  if (!organizationIDResult) {
    return [];
  }

  const organizationID = organizationIDResult.organizationID;

  const cutoffDateInteger = dateTimeFns.dateToInteger(new Date()) - 50000;

  const bankInfoList: PastEventBankingInformation[] = db.prepare("select bank_name, bank_address, bank_accountNumber," +
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
