"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicenceTypeKeyToNameObject = exports.getLicenceType = exports.keepAliveMillis = exports.getProperty = void 0;
const config = require("../data/config");
const configFallbackValues = new Map();
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
]);
configFallbackValues.set("licences.externalLicenceNumber.fieldLabel", "External Licence Number");
configFallbackValues.set("licences.externalLicenceNumber.newCalculation", "");
configFallbackValues.set("licences.externalLicenceNumber.isPreferredID", false);
configFallbackValues.set("licences.externalReceiptNumber.fieldLabel", "Receipt Number");
configFallbackValues.set("licences.feeCalculationFn", (_licenceObj) => {
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
function getProperty(propertyName) {
    const propertyNameSplit = propertyName.split(".");
    let currentObj = config;
    for (const propertyNamePiece of propertyNameSplit) {
        if (currentObj.hasOwnProperty(propertyNamePiece)) {
            currentObj = currentObj[propertyNamePiece];
        }
        else {
            return configFallbackValues.get(propertyName);
        }
    }
    return currentObj;
}
exports.getProperty = getProperty;
exports.keepAliveMillis = getProperty("session.doKeepAlive")
    ? Math.max(getProperty("session.maxAgeMillis") / 2, getProperty("session.maxAgeMillis") - (10 * 60 * 1000))
    : 0;
const licenceTypeCache = new Map();
let licenceTypeKeyNameObject = {};
exports.getLicenceType = (licenceTypeKey) => {
    if (!licenceTypeCache.has(licenceTypeKey)) {
        const licenceType = getProperty("licenceTypes")
            .find((ele) => ele.licenceTypeKey === licenceTypeKey);
        licenceTypeCache.set(licenceTypeKey, licenceType);
    }
    return licenceTypeCache.get(licenceTypeKey);
};
exports.getLicenceTypeKeyToNameObject = () => {
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
