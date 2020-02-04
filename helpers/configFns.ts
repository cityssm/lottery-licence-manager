"use strict";

import { Config_BankRecordType, Config_LicenceType } from "../helpers/llmTypes";


/*
 * LOAD CONFIGURATION
 */

export let config = {};

try {

  config = require("../data/config");

} catch (e) {

  config = {};

  // eslint-disable-next-line no-console
  console.log("No \"config.js\" found." +
    " To customize, create your own \"config.js\" in the \"data\" folder." +
    " See \"config-example.js\" or \"config-example-ontario.js\" to get started.");

}


/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = {

  "application.applicationName": "Lottery Licence System",
  "application.logoURL": "/images/bingoBalls.png",
  "application.httpPort": 3000,

  "session.cookieName": "lottery-licence-manager-user-sid",
  "session.secret": "cityssm/lottery-licence-manager",
  "session.maxAgeMillis": 60 * 60 * 1000,

  "admin.defaultPassword": "",

  "user.createUpdateWindowMillis": 60 * 60 * 1000,
  "user.defaultProperties": {
    canCreate: "false",
    canUpdate: "false",
    isAdmin: "false"
  },

  "defaults.city": "",
  "defaults.province": "",

  "bankRecordTypes": <Config_BankRecordType[]>[
    {
      bankRecordType: "statement",
      bankRecordTypeName: "Bank Statement"
    }, {
      bankRecordType: "cheques",
      bankRecordTypeName: "Cheques"
    }, {
      bankRecordType: "receipts",
      bankRecordTypeName: "Receipts"
    }
  ],

  "licences.externalLicenceNumber.fieldLabel": "External Licence Number",
  "licences.externalLicenceNumber.newCalculation": "",

  "licences.externalReceiptNumber.fieldLabel": "Receipt Number",

  "licences.feeCalculationFn": function() {

    return {
      fee: 10,
      message: "Using base licence fee.",
      licenceHasErrors: false
    };

  },

  "licences.printTemplate": "licence-print",

  "licenceTypes": [],

  "amendments.displayCount": 5,

  "amendments.trackLicenceFeeUpdate": true,
  "amendments.trackDateTimeUpdate": true,
  "amendments.trackOrganizationUpdate": true,
  "amendments.trackLocationUpdate": true,

  "amendments.trackTicketTypeNew": true,
  "amendments.trackTicketTypeUpdate": true,
  "amendments.trackTicketTypeDelete": true
};

export function getProperty(propertyName: string): any {

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (let index = 0; index < propertyNameSplit.length; index += 1) {

    currentObj = currentObj[propertyNameSplit[index]];

    if (!currentObj) {

      return configFallbackValues[propertyName];

    }

  }

  return currentObj;

}


/*
 * LICENCE TYPES
 */

const licenceTypeCache = {};

export function getLicenceType(licenceTypeKey: string): Config_LicenceType {

  if (!licenceTypeCache[licenceTypeKey]) {

    licenceTypeCache[licenceTypeKey] =
      getProperty("licenceTypes").find(
        function(ele: Config_LicenceType) {
          return (ele.licenceTypeKey === licenceTypeKey);
        }
      );

  }

  return licenceTypeCache[licenceTypeKey];

}


/*
 * UID GENERATOR
 */

let uid = Date.now();

export function getUID() {

  const toReturn = uid;

  uid += 1;

  return "uid" + toReturn.toString();

}
