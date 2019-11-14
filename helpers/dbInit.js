/* global require, module */


const sqlite = require("better-sqlite3");


let dbInit = {

  initUsersDB: function() {

    "use strict";

    const usersDB = sqlite("data/users.db");

    const row = usersDB.prepare("select name from sqlite_master where type = 'table' and name = 'Users'").get();

    if (!row) {

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

      licencesDB.prepare("create table if not exists Organizations (" +
        "OrganizationID integer primary key autoincrement," +
        " OrganizationName varchar(100) not null," +
        " OrganizationAddress1 varchar(50), OrganizationAddress2 varchar(50)," +
        " OrganizationCity varchar(20), OrganizationProvince varchar(2)," +
        " OrganizationPostalCode varchar(6)," +
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
        " RepresentativePostalCode varchar(6)," +
        " IsDefault bit not null default 0," +
        " primary key (OrganizationID, RepresentativeIndex)" +
        ")").run();
    }

    return false;
  }
};


module.exports = dbInit;
