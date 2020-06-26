import * as llm from "../helpers/llmTypes";


/*
 * LOAD CONFIGURATION
 */

import * as config from "../data/config";


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

configFallbackValues.set("bankRecordTypes", <llm.ConfigBankRecordType[]>[
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
]);

configFallbackValues.set("licences.externalLicenceNumber.fieldLabel", "External Licence Number");
configFallbackValues.set("licences.externalLicenceNumber.newCalculation", "");
configFallbackValues.set("licences.externalLicenceNumber.isPreferredID", false);

configFallbackValues.set("licences.externalReceiptNumber.fieldLabel", "Receipt Number");

configFallbackValues.set("licences.feeCalculationFn", () => {

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


// tslint:disable-next-line:no-any
export const getProperty = (propertyName: string): any => {

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

};

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

const licenceTypeCache = new Map<string, llm.ConfigLicenceType>();
let licenceTypeKeyNameObject = {};

export const getLicenceType = (licenceTypeKey: string): llm.ConfigLicenceType => {

  if (!licenceTypeCache.has(licenceTypeKey)) {

    const licenceType = (<llm.ConfigLicenceType[]>getProperty("licenceTypes"))
      .find((ele) => ele.licenceTypeKey === licenceTypeKey);

    licenceTypeCache.set(licenceTypeKey, licenceType);
  }

  return licenceTypeCache.get(licenceTypeKey);
};

export const getLicenceTypeKeyToNameObject = () => {

  if (Object.keys(licenceTypeKeyNameObject).length === 0) {

    const list = {};

    (<llm.ConfigLicenceType[]>getProperty("licenceTypes"))
      .forEach((ele) => {

        if (ele.isActive) {
          list[ele.licenceTypeKey] = ele.licenceType;
        }
      });

    licenceTypeKeyNameObject = list;
  }

  return licenceTypeKeyNameObject;
};
