/* global require, console, module */
/* eslint-disable no-console */


const sqlite = require("better-sqlite3");


let dbInit = {

  initUsersDB: function() {

    "use strict";

    const usersDB = sqlite("data/users.db");

    const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();

    if (!row) {

      console.warn("Creating users.db");

      usersDB.prepare("create table if not exists Users (" +
        "UserName varchar(30) primary key not null," +
        " FirstName varchar(50), LastName varchar(50)," +
        " IsActive boolean not null default 1," +
        " TempPassword varchar(50), PasswordHash char(60))" +
        " without rowid").run();

      usersDB.prepare("create table if not exists UserProperties (" +
        "UserName varchar(30) not null," +
        " PropertyName varchar(100) not null," +
        " PropertyValue text," +
        " primary key (UserName, PropertyName)" +
        " foreign key (UserName) references Users (UserName))" +
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
        "OrganizationID integer primary key autoincrement," +
        " OrganizationName varchar(100) not null," +
        " OrganizationAddress1 varchar(50), OrganizationAddress2 varchar(50)," +
        " OrganizationCity varchar(20), OrganizationProvince varchar(2)," +
        " OrganizationPostalCode varchar(7)," +
        " RecordCreate_UserName varchar(30) not null," +
        " RecordCreate_TimeMillis integer not null," +
        " RecordUpdate_UserName varchar(30) not null," +
        " RecordUpdate_TimeMillis integer not null," +
        " RecordDelete_UserName varchar(30)," +
        " RecordDelete_TimeMillis integer" +
        ")").run();

      licencesDB.prepare("create table if not exists OrganizationRepresentatives (" +
        "OrganizationID integer not null, RepresentativeIndex smallint not null," +
        " RepresentativeName varchar(100) not null," +
        " RepresentativeTitle varchar(100)," +
        " RepresentativeAddress1 varchar(50), RepresentativeAddress2 varchar(50)," +
        " RepresentativeCity varchar(20), RepresentativeProvince varchar(2)," +
        " RepresentativePostalCode varchar(7)," +
        " IsDefault bit not null default 0," +
        " primary key (OrganizationID, RepresentativeIndex)," +
        " foreign key (OrganizationID) references Organizations (OrganizationID)" +
        ")").run();

      // licences

      licencesDB.prepare("create table if not exists LotteryLicences (" +
        "LicenceID integer primary key autoincrement," +
        " OrganizationID integer not null," +
        " ApplicationDate integer not null," +
        " LicenceTypeKey char(2) not null," +

        " StartDate integer, EndDate integer," +
        " StartTime integer, EndTime integer," +

        " Location varchar(100)," +
        " Municipality varchar(100)," +
        " LicenceDetails text," +
        " TermsConditions text," +

        " ExternalLicenceNumber varchar(20)," +
        " ExternalReceiptNumber varchar(20)," +

        " RecordCreate_UserName varchar(30) not null," +
        " RecordCreate_TimeMillis integer not null," +
        " RecordUpdate_UserName varchar(30) not null," +
        " RecordUpdate_TimeMillis integer not null," +
        " RecordDelete_UserName varchar(30)," +
        " RecordDelete_TimeMillis integer," +

        " foreign key (OrganizationID) references Organizations (OrganizationID)" +
        ")").run();

      licencesDB.prepare("create table if not exists LotteryLicenceFields (" +
        "LicenceID integer not null," +
        " FieldKey varchar(20) not null," +
        " FieldValue text," +

        " primary key (LicenceID, FieldKey)," +
        " foreign key (LicenceID) references LotteryLicences (LicenceID)" +
        ") without rowid").run();

      // events

      licencesDB.prepare("create table if not exists LotteryEvents (" +
        "LicenceID integer not null," +
        " EventDate integer not null," +

        " RecordCreate_UserName varchar(30) not null," +
        " RecordCreate_TimeMillis integer not null," +
        " RecordUpdate_UserName varchar(30) not null," +
        " RecordUpdate_TimeMillis integer not null," +
        " RecordDelete_UserName varchar(30)," +
        " RecordDelete_TimeMillis integer," +

        " primary key (LicenceID, EventDate)," +
        " foreign key (LicenceID) references LotteryLicences (LicenceID)" +
        ") without rowid").run();

      licencesDB.prepare("create table if not exists LotteryEventFields (" +
        "LicenceID integer not null," +
        " EventDate integer not null," +
        " FieldKey varchar(20) not null," +
        " FieldValue text," +

        " primary key (LicenceID, EventDate, FieldKey)," +
        " foreign key (LicenceID, EventDate) references LotteryEvents (LicenceID, EventDate)" +
        ") without rowid").run();
    }

    return false;
  }
};


module.exports = dbInit;
