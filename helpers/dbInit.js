/* global require, console, module */
/* eslint-disable no-console */


const sqlite = require("better-sqlite3");


let dbInit = {

  initUsersDB: function() {

    "use strict";

    const usersDB = sqlite("data/users.db");

    const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();

    if (!row) {

      console.warn("Creating users.db.  To get started creating users, set the 'admin.defaultPassword' property in your config.js file.");

      usersDB.prepare("create table if not exists Users (" +
        "userName varchar(30) primary key not null," +
        " firstName varchar(50), lastName varchar(50)," +
        " isActive boolean not null default 1," +
        " passwordHash char(60) not null)" +
        " without rowid").run();

      usersDB.prepare("create table if not exists UserProperties (" +
        "userName varchar(30) not null," +
        " propertyName varchar(100) not null," +
        " propertyValue text," +
        " primary key (userName, propertyName)" +
        " foreign key (userName) references Users (userName))" +
        " without rowid").run();

      usersDB.close();

      return true;
    }

    return false;
  },

  initLicencesDB: function() {

    "use strict";

    const licencesDB = sqlite("data/licences.db");

    const row = licencesDB.prepare("select name from sqlite_master where type = 'table' and name = 'Organizations'").get();

    if (!row) {

      console.warn("Creating licences.db");

      // organizations

      licencesDB.prepare("create table if not exists Organizations (" +
        "organizationID integer primary key autoincrement," +
        " organizationName varchar(100) not null," +
        " organizationAddress1 varchar(50)," +
        " organizationAddress2 varchar(50)," +
        " organizationCity varchar(20)," +
        " organizationProvince varchar(2)," +
        " organizationPostalCode varchar(7)," +

        " isEligibleForLicences bit not null default 1," +
        " organizationNote text," +

        " recordCreate_userName varchar(30) not null," +
        " recordCreate_timeMillis integer not null," +
        " recordUpdate_userName varchar(30) not null," +
        " recordUpdate_timeMillis integer not null," +
        " recordDelete_userName varchar(30)," +
        " recordDelete_timeMillis integer" +
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
        " representativeEmailAddress varchar(200)," +
        " isDefault bit not null default 0," +
        " primary key (organizationID, representativeIndex)," +
        " foreign key (organizationID) references Organizations (organizationID)" +
        ")").run();

      // licences

      licencesDB.prepare("create table if not exists LotteryLicences (" +
        "licenceID integer primary key autoincrement," +
        " organizationID integer not null," +

        " externalLicenceNumber varchar(20)," +
        " externalLicenceNumberInteger bigint not null," +

        " applicationDate integer not null," +
        " licenceTypeKey char(2) not null," +

        " startDate integer, endDate integer," +
        " startTime integer, endTime integer," +

        " location varchar(100)," +
        " municipality varchar(100)," +
        " licenceDetails text," +
        " termsConditions text," +

        " totalPrizeValue decimal(10, 2)," +

        " externalReceiptNumber varchar(20)," +
        " licenceFee decimal(10, 2)," +
        " licenceFeeIsPaid boolean not null default 0," +

        " recordCreate_userName varchar(30) not null," +
        " recordCreate_timeMillis integer not null," +
        " recordUpdate_userName varchar(30) not null," +
        " recordUpdate_timeMillis integer not null," +
        " recordDelete_userName varchar(30)," +
        " recordDelete_timeMillis integer," +

        " foreign key (organizationID) references Organizations (organizationID)" +
        ")").run();

      licencesDB.prepare("create index if not exists LotteryLicences_ExternalLicenceNumberInteger_Index" +
        " on LotteryLicences (externalLicenceNumberInteger desc)" +
        " where externalLicenceNumberInteger <> -1").run();

      licencesDB.prepare("create table if not exists LotteryLicenceFields (" +
        "licenceID integer not null," +
        " fieldKey varchar(20) not null," +
        " fieldValue text," +

        " primary key (licenceID, fieldKey)," +
        " foreign key (licenceID) references LotteryLicences (licenceID)" +
        ") without rowid").run();

      // events

      licencesDB.prepare("create table if not exists LotteryEvents (" +
        "licenceID integer not null," +
        " eventDate integer not null," +

        " bank_name varchar(50)," +
        " bank_address varchar(50)," +
        " bank_accountNumber varchar(20)," +
        " bank_accountBalance decimal(12, 2)," +

        " costs_receipts decimal(10, 2)," +
        " costs_admin decimal(10, 2)," +
        " costs_prizesAwarded decimal(10, 2)," +
        " costs_charitableDonations decimal(10, 2)," +
        " costs_netProceeds decimal(10, 2)," +
        " costs_amountDonated decimal(10, 2)," +

        " recordCreate_userName varchar(30) not null," +
        " recordCreate_timeMillis integer not null," +
        " recordUpdate_userName varchar(30) not null," +
        " recordUpdate_timeMillis integer not null," +
        " recordDelete_userName varchar(30)," +
        " recordDelete_timeMillis integer," +

        " primary key (licenceID, eventDate)," +
        " foreign key (licenceID) references LotteryLicences (licenceID)" +
        ") without rowid").run();

      licencesDB.prepare("create table if not exists LotteryEventFields (" +
        "licenceID integer not null," +
        " eventDate integer not null," +
        " fieldKey varchar(20) not null," +
        " fieldValue text," +

        " primary key (licenceID, eventDate, fieldKey)," +
        " foreign key (licenceID, eventDate) references LotteryEvents (licenceID, eventDate)" +
        ") without rowid").run();

      // settings

      licencesDB.prepare("create table if not exists ApplicationSettings (" +
        "settingKey varchar(50) primary key not null," +
        " settingName varchar(100) not null," +
        " settingDescription text," +
        " settingValue text," +
        " orderNumber smallint not null default 0," +
        " recordUpdate_userName varchar(30) not null," +
        " recordUpdate_timeMillis integer not null" +
        ") without rowid").run();

      // default settings

      let settingInsertSQL = "insert or ignore into ApplicationSettings" +
        " (settingKey, settingName, settingDescription, settingValue, orderNumber, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?)";

      licencesDB.prepare(settingInsertSQL)
        .run("licences.externalLicenceNumber.range.start",
          "External Licence Number: Range Start",
          "When External Licence Numbers are generated using a range, this value will be used as the minimum for the range.",
          "-1",
          1,
          "init",
          Date.now());

      licencesDB.prepare(settingInsertSQL)
        .run("licences.externalLicenceNumber.range.end",
          "External Licence Number: Range End",
          "When External Licence Numbers are generated using a range, this value will be used as the maximum for the range.",
          "0",
          2,
          "init",
          Date.now());
    }

    return false;
  }
};


module.exports = dbInit;
