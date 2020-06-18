import * as llm from "../helpers/llmTypes";


/*
 * LOAD CONFIGURATION
 */

import * as config from "../data/config";


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
  "session.doKeepAlive": false,

  "admin.defaultPassword": "",

  "user.createUpdateWindowMillis": 60 * 60 * 1000,
  "user.defaultProperties": {
    canCreate: false,
    canUpdate: false,
    isAdmin: false
  },

  "defaults.city": "",
  "defaults.province": "",

  "bankRecordTypes": <llm.ConfigBankRecordType[]>[
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
  "licences.externalLicenceNumber.isPreferredID": false,

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

export const keepAliveMillis =
  getProperty("session.doKeepAlive") ?
    Math.max(
      getProperty("session.maxAgeMillis") / 2,
      getProperty("session.maxAgeMillis") - (10 * 60 * 1000)
    ) :
    0;


/*
 * LICENCE TYPES
 */

const licenceTypeCache = {};
let licenceTypeKeyNameObject = {};

export function getLicenceType(licenceTypeKey: string): llm.ConfigLicenceType {

  if (!licenceTypeCache[licenceTypeKey]) {

    licenceTypeCache[licenceTypeKey] =
      getProperty("licenceTypes").find(
        function(ele: llm.ConfigLicenceType) {
          return (ele.licenceTypeKey === licenceTypeKey);
        }
      );

  }

  return licenceTypeCache[licenceTypeKey];

}

export function getLicenceTypeKeyToNameObject() {

  if (Object.keys(licenceTypeKeyNameObject).length === 0) {

    let list = {};

    getProperty("licenceTypes").forEach(function(ele: llm.ConfigLicenceType) {

      if (ele.isActive) {
        list[ele.licenceTypeKey] = ele.licenceType;
      }

    });

    licenceTypeKeyNameObject = list;
  }

  return licenceTypeKeyNameObject;

}
