import * as log from "fancy-log";

import * as llm from "../helpers/llmTypes";


/*
 * LOAD CONFIGURATION
 */

let config = "";

try {
  config = require("../data/config");
} catch (_e) {
  log.warn("Using data/config-example.js");
  config = require("../data/config-example");
}


/*
 * SET UP FALLBACK VALUES
 */

// tslint:disable-next-line:no-any
const configFallbackValues = new Map<string, any>();

configFallbackValues.set("application.applicationName", "Lottery Licence System");
configFallbackValues.set("application.logoURL", "/images/bingoBalls.png");
configFallbackValues.set("application.httpPort", 3000);

configFallbackValues.set("session.cookieName", "lottery-licence-manager-user-sid");
configFallbackValues.set("session.secret", "cityssm/lottery-licence-manager");
configFallbackValues.set("session.maxAgeMillis", 60 * 60 * 1000);
configFallbackValues.set("session.doKeepAlive", false);

configFallbackValues.set("admin.defaultPassword", "");

configFallbackValues.set("user.createUpdateWindowMillis", 60 * 60 * 1000);
configFallbackValues.set("user.defaultProperties", {
  canCreate: false,
  canUpdate: false,
  isAdmin: false
});

configFallbackValues.set("defaults.city", "");
configFallbackValues.set("defaults.province", "");

configFallbackValues.set("reminderCategories", []);

configFallbackValues.set("bankRecordTypes", [
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
] as llm.ConfigBankRecordType[]);

configFallbackValues.set("licences.externalLicenceNumber.fieldLabel", "External Licence Number");
configFallbackValues.set("licences.externalLicenceNumber.newCalculation", "");
configFallbackValues.set("licences.externalLicenceNumber.isPreferredID", false);

configFallbackValues.set("licences.externalReceiptNumber.fieldLabel", "Receipt Number");

configFallbackValues.set("licences.feeCalculationFn", (_licenceObj: llm.LotteryLicence) => {

  return {
    fee: 10,
    message: "Using base licence fee.",
    licenceHasErrors: false
  };

});

configFallbackValues.set("licences.printTemplate", "licence-print");

configFallbackValues.set("licenceTypes", []);

configFallbackValues.set("amendments.displayCount", 5);

configFallbackValues.set("amendments.trackLicenceFeeUpdate", true);
configFallbackValues.set("amendments.trackDateTimeUpdate", true);
configFallbackValues.set("amendments.trackOrganizationUpdate", true);
configFallbackValues.set("amendments.trackLocationUpdate", true);

configFallbackValues.set("amendments.trackTicketTypeNew", true);
configFallbackValues.set("amendments.trackTicketTypeUpdate", true);
configFallbackValues.set("amendments.trackTicketTypeDelete", true);

/*
 * Set up function overloads
 */

export function getProperty(propertyName: "admin.defaultPassword"): string;

export function getProperty(propertyName: "amendments.displayCount"): number;
export function getProperty(propertyName: "amendments.trackLicenceFeeUpdate"): boolean;
export function getProperty(propertyName: "amendments.trackDateTimeUpdate"): boolean;
export function getProperty(propertyName: "amendments.trackOrganizationUpdate"): boolean;
export function getProperty(propertyName: "amendments.trackLocationUpdate"): boolean;
export function getProperty(propertyName: "amendments.trackTicketTypeNew"): boolean;
export function getProperty(propertyName: "amendments.trackTicketTypeUpdate"): boolean;
export function getProperty(propertyName: "amendments.trackTicketTypeDelete"): boolean;

export function getProperty(propertyName: "application.applicationName"): string;
export function getProperty(propertyName: "application.logoURL"): string;
export function getProperty(propertyName: "application.httpPort"): number;

export function getProperty(propertyName: "application.https"): llm.ConfigHTTPS;

export function getProperty(propertyName: "bankRecordTypes"): llm.ConfigBankRecordType[];

export function getProperty(propertyName: "defaults.city"): string;
export function getProperty(propertyName: "defaults.province"): string;

export function getProperty(propertyName: "licences.externalLicenceNumber.fieldLabel"): string;
export function getProperty(propertyName: "licences.externalLicenceNumber.newCalculation"): "" | "range";
export function getProperty(propertyName: "licences.externalLicenceNumber.isPreferredID"): boolean;

export function getProperty(propertyName: "licences.externalReceiptNumber.fieldLabel"): string;

export function getProperty(propertyName: "licences.feeCalculationFn"): (licenceObj: llm.LotteryLicence) => { fee: number; message: string; licenceHasErrors: boolean };

export function getProperty(propertyName: "licences.printTemplate"): string;

export function getProperty(propertyName: "licenceTypes"): llm.ConfigLicenceType[];

export function getProperty(propertyName: "reminderCategories"): llm.ConfigReminderCategory[];

export function getProperty(propertyName: "session.cookieName"): string;
export function getProperty(propertyName: "session.doKeepAlive"): boolean;
export function getProperty(propertyName: "session.maxAgeMillis"): number;
export function getProperty(propertyName: "session.secret"): string;

export function getProperty(propertyName: "user.createUpdateWindowMillis"): number;
export function getProperty(propertyName: "user.defaultProperties"): llm.UserProperties;

export function getProperty(propertyName: string): any {

  const propertyNameSplit = propertyName.split(".");

  let currentObj = config;

  for (const propertyNamePiece of propertyNameSplit) {

    if (currentObj.hasOwnProperty(propertyNamePiece)) {
      currentObj = currentObj[propertyNamePiece];
    } else {
      return configFallbackValues.get(propertyName);
    }
  }

  return currentObj;

}

export const keepAliveMillis =
  getProperty("session.doKeepAlive")
    ? Math.max(
      getProperty("session.maxAgeMillis") / 2,
      getProperty("session.maxAgeMillis") - (10 * 60 * 1000)
    )
    : 0;


/*
 * REMINDER TYPES
 */

const reminderTypeCache = new Map<string, llm.ConfigReminderType>();

export const getReminderType = (reminderTypeKey: string): llm.ConfigReminderType => {

  if (reminderTypeCache.size === 0) {

    for (const reminderCategory of getProperty("reminderCategories")) {
      for (const reminderType of reminderCategory.reminderTypes) {
        reminderType.reminderCategory = reminderCategory.reminderCategory;
        reminderTypeCache.set(reminderType.reminderTypeKey, reminderType);
      }
    }
  }

  return reminderTypeCache.get(reminderTypeKey);
};


/*
 * LICENCE TYPES
 */


const licenceTypeCache = new Map<string, llm.ConfigLicenceType>();
let licenceTypeKeyNameObject = {};

export const getLicenceType = (licenceTypeKey: string): llm.ConfigLicenceType => {

  if (!licenceTypeCache.has(licenceTypeKey)) {

    const licenceType = getProperty("licenceTypes")
      .find((ele) => ele.licenceTypeKey === licenceTypeKey);

    licenceTypeCache.set(licenceTypeKey, licenceType);
  }

  return licenceTypeCache.get(licenceTypeKey);
};

export const getLicenceTypeKeyToNameObject = () => {

  if (Object.keys(licenceTypeKeyNameObject).length === 0) {

    const list = {};

    getProperty("licenceTypes")
      .forEach((ele) => {

        if (ele.isActive) {
          list[ele.licenceTypeKey] = ele.licenceType;
        }
      });

    licenceTypeKeyNameObject = list;
  }

  return licenceTypeKeyNameObject;
};
