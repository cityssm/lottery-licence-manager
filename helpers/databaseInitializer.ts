import sqlite from "better-sqlite3";

import { licencesDB as databasePath } from "../data/databasePaths.js";

import debug from "debug";
const debugSQL = debug("lottery-licence-manager:databaseInitializer");


const recordColumns = " recordCreate_userName varchar(30) not null," +
  " recordCreate_timeMillis integer not null," +
  " recordUpdate_userName varchar(30) not null," +
  " recordUpdate_timeMillis integer not null," +
  " recordDelete_userName varchar(30)," +
  " recordDelete_timeMillis integer";


export const initLicencesDB = (): boolean => {

  const licencesDB = sqlite(databasePath);

  const row = licencesDB
    .prepare("select name from sqlite_master where type = 'table' and name = 'Organizations'")
    .get();

  if (!row) {

    debugSQL("Creating " + databasePath);

    /*
     * Locations
     */

    licencesDB.prepare("create table if not exists Locations (" +

      "locationID integer primary key autoincrement," +
      " locationName varchar(100)," +
      " locationAddress1 varchar(50)," +
      " locationAddress2 varchar(50)," +
      " locationCity varchar(20)," +
      " locationProvince varchar(2)," +
      " locationPostalCode varchar(7)," +

      " locationIsDistributor bit not null default 0," +
      " locationIsManufacturer bit not null default 0," +

      recordColumns +
      ")").run();

    /*
     * Organizations
     */

    licencesDB.prepare("create table if not exists Organizations (" +

      "organizationID integer primary key autoincrement," +
      " organizationName varchar(100) not null," +
      " organizationAddress1 varchar(50)," +
      " organizationAddress2 varchar(50)," +
      " organizationCity varchar(20)," +
      " organizationProvince varchar(2)," +
      " organizationPostalCode varchar(7)," +

      " trustAccountNumber varchar(20)," +
      " fiscalStartDate integer," +
      " fiscalEndDate integer," +
      " isEligibleForLicences bit not null default 1," +
      " organizationNote text not null default ''," +

      recordColumns +

      ")").run();

    licencesDB.prepare("create table if not exists OrganizationRepresentatives (" +

      "organizationID integer not null," +
      " representativeIndex smallint not null," +
      " representativeName varchar(100) not null," +
      " representativeTitle varchar(100)," +
      " representativeAddress1 varchar(50)," +
      " representativeAddress2 varchar(50)," +
      " representativeCity varchar(20)," +
      " representativeProvince varchar(2)," +
      " representativePostalCode varchar(7)," +
      " representativePhoneNumber varchar(30)," +
      " representativePhoneNumber2 varchar(30)," +
      " representativeEmailAddress varchar(200)," +
      " isDefault bit not null default 0," +

      " primary key (organizationID, representativeIndex)," +
      " foreign key (organizationID) references Organizations (organizationID)" +
      ") without rowid").run();

    licencesDB.prepare("create table if not exists OrganizationRemarks (" +

      "organizationID integer not null," +
      " remarkIndex integer not null," +
      " remarkDate integer, remarkTime integer," +
      " remark text," +
      " isImportant bit not null default 0," +

      recordColumns + "," +

      " primary key (organizationID, remarkIndex)," +
      " foreign key (organizationID) references Organizations (organizationID)" +
      ") without rowid").run();

    licencesDB.prepare("create table if not exists OrganizationReminders (" +

      "organizationID integer not null," +
      " reminderIndex integer not null," +

      " reminderTypeKey varchar(15) not null," +
      " dueDate integer," +
      " dismissedDate integer," +
      " reminderStatus varchar(20)," +
      " reminderNote text," +

      recordColumns + "," +

      " primary key (organizationID, reminderIndex)," +
      " foreign key (organizationID) references Organizations (organizationID)" +

      ") without rowid").run();

    licencesDB.prepare("create table BankingMonths (bankingMonth integer primary key not null)").run();

    for (let month = 1; month <= 12; month += 1) {
      licencesDB.prepare("insert into BankingMonths (bankingMonth) values (" + month + ")").run();
    }

    licencesDB.prepare("create table if not exists OrganizationBankRecords (" +

      "organizationID integer not null," +
      " recordIndex integer not null," +

      " accountNumber varchar(20) not null," +
      " bankingYear integer not null," +
      " bankingMonth integer not null," +
      " bankRecordType varchar(10) not null," +
      " recordIsNA bit not null default 0," +

      " recordDate integer," +
      " recordNote text," +

      recordColumns + "," +

      " primary key (organizationID, recordIndex)," +
      " unique (organizationID, accountNumber, bankingYear, bankingMonth, bankRecordType)," +
      " foreign key (organizationID) references Organizations (organizationID)" +
      ") without rowid").run();

    /*
     * Licences
     */

    licencesDB.prepare("create table if not exists LotteryLicences (" +

      "licenceID integer primary key autoincrement," +
      " organizationID integer not null," +

      " externalLicenceNumber varchar(20)," +
      " externalLicenceNumberInteger bigint not null," +

      " applicationDate integer not null," +
      " licenceTypeKey char(2) not null," +

      " startDate integer, endDate integer," +
      " startTime integer, endTime integer," +

      " locationID integer," +
      " municipality varchar(100)," +
      " licenceDetails text," +
      " termsConditions text," +

      " totalPrizeValue decimal(10, 2)," +
      " licenceFee decimal(10, 2)," +

      " issueDate integer, issueTime integer," +

      " trackUpdatesAsAmendments bit not null default 0," +

      recordColumns + "," +

      " foreign key (organizationID) references Organizations (organizationID)," +
      " foreign key (locationID) references Locations (locationID)" +

      ")").run();


    licencesDB.prepare("create index if not exists LotteryLicences_ExternalLicenceNumberInteger_Index" +
      " on LotteryLicences (externalLicenceNumberInteger desc)" +
      " where externalLicenceNumberInteger <> -1").run();


    licencesDB.prepare("create table if not exists LotteryLicenceTransactions (" +

      "licenceID integer not null," +
      " transactionIndex integer not null," +

      " transactionDate integer not null," +
      " transactionTime integer not null," +
      " externalReceiptNumber varchar(20)," +
      " transactionAmount decimal(10, 2) not null," +

      " transactionNote text," +

      recordColumns + "," +

      " primary key (licenceID, transactionIndex)," +

      " foreign key (licenceID) references LotteryLicences (licenceID)" +

      ") without rowid").run();


    licencesDB.prepare("create table if not exists LotteryLicenceAmendments (" +

      "licenceID integer not null," +
      " amendmentIndex integer not null," +

      " amendmentDate integer not null, amendmentTime integer not null," +
      " amendmentType text not null, amendment text," +
      " isHidden bit not null default 0," +

      recordColumns + "," +

      " primary key (licenceID, amendmentIndex)," +

      " foreign key (licenceID) references LotteryLicences (licenceID)" +
      ") without rowid").run();


    licencesDB.prepare("create table if not exists LotteryEvents (" +

      "licenceID integer not null," +
      " eventDate integer not null," +

      " reportDate integer," +

      " bank_name varchar(50)," +
      " bank_address varchar(50)," +
      " bank_accountNumber varchar(20)," +
      " bank_accountBalance decimal(12, 2)," +

      " costs_amountDonated decimal(10, 2)," +

      recordColumns + "," +

      " primary key (licenceID, eventDate)," +
      " foreign key (licenceID) references LotteryLicences (licenceID)" +
      ") without rowid").run();


    licencesDB.prepare("create table if not exists LotteryLicenceTicketTypes (" +

      "licenceID integer not null," +
      " ticketTypeIndex integer not null," +

      " amendmentDate integer not null," +
      " ticketType varchar(5) not null," +

      " distributorLocationID integer," +
      " manufacturerLocationID integer," +

      " unitCount integer not null," +
      " licenceFee decimal(10, 2)," +

      recordColumns + "," +

      " primary key (licenceID, ticketTypeIndex)," +

      " foreign key (licenceID) references LotteryLicences (licenceID)," +
      " foreign key (distributorLocationID) references Locations (locationID)," +
      " foreign key (manufacturerLocationID) references Locations (locationID)" +

      ") without rowid").run();


    licencesDB.prepare("create table if not exists LotteryLicenceFields (" +

      "licenceID integer not null," +
      " fieldKey varchar(20) not null," +
      " fieldValue text," +

      " primary key (licenceID, fieldKey)," +
      " foreign key (licenceID) references LotteryLicences (licenceID)" +
      ") without rowid").run();


    /*
     * Events
     */


    licencesDB.prepare("create table if not exists LotteryEventCosts (" +

      "licenceID integer not null," +
      " eventDate integer not null," +
      " ticketType varchar(5)," +
      " costs_receipts decimal(10, 2)," +
      " costs_admin decimal(10, 2)," +
      " costs_prizesAwarded decimal(10, 2)," +
      " primary key (licenceID, eventDate, ticketType)," +
      " foreign key (licenceID, eventDate) references LotteryEvents (licenceID, eventDate)" +
      ")").run();

    licencesDB.prepare("create table if not exists LotteryEventFields (" +

      "licenceID integer not null," +
      " eventDate integer not null," +
      " fieldKey varchar(20) not null," +
      " fieldValue text," +

      " primary key (licenceID, eventDate, fieldKey)," +
      " foreign key (licenceID, eventDate) references LotteryEvents (licenceID, eventDate)" +
      ") without rowid").run();

    // Settings

    licencesDB.prepare("create table if not exists ApplicationSettings (" +

      "settingKey varchar(50) primary key not null," +
      " settingName varchar(100) not null," +
      " settingDescription text," +
      " settingValue text," +
      " orderNumber smallint not null default 0," +
      " recordUpdate_userName varchar(30) not null," +
      " recordUpdate_timeMillis integer not null" +
      ") without rowid").run();

    // Default settings

    const settingInsertSQL = "insert or ignore into ApplicationSettings" +
      " (settingKey, settingName, settingDescription, settingValue, orderNumber," +
      " recordUpdate_userName, recordUpdate_timeMillis)" +
      " values (?, ?, ?, ?, ?, ?, ?)";

    licencesDB.prepare(settingInsertSQL)
      .run(
        "licences.externalLicenceNumber.range.start",
        "External Licence Number: Range Start",
        ("When External Licence Numbers are generated using a range," +
          " this value will be used as the minimum for the range."),
        "-1",
        1,
        "init",
        Date.now()
      );

    licencesDB.prepare(settingInsertSQL)
      .run(
        "licences.externalLicenceNumber.range.end",
        "External Licence Number: Range End",
        ("When External Licence Numbers are generated using a range," +
          " this value will be used as the maximum for the range."),
        "0",
        2,
        "init",
        Date.now()
      );

    licencesDB.close();

    return true;
  }

  return false;
};
