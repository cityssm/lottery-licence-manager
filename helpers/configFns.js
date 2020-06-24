"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicenceTypeKeyToNameObject = exports.getLicenceType = exports.keepAliveMillis = exports.getProperty = void 0;
const config = require("../data/config");
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
    "bankRecordTypes": [
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
    "licences.feeCalculationFn"() {
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
exports.getProperty = (propertyName) => {
    const propertyNameSplit = propertyName.split(".");
    let currentObj = config;
    for (const propertyNamePiece of propertyNameSplit) {
        currentObj = currentObj[propertyNamePiece];
        if (!currentObj) {
            return configFallbackValues[propertyName];
        }
    }
    return currentObj;
};
exports.keepAliveMillis = exports.getProperty("session.doKeepAlive") ?
    Math.max(exports.getProperty("session.maxAgeMillis") / 2, exports.getProperty("session.maxAgeMillis") - (10 * 60 * 1000)) :
    0;
const licenceTypeCache = new Map();
let licenceTypeKeyNameObject = {};
exports.getLicenceType = (licenceTypeKey) => {
    if (!licenceTypeCache.has(licenceTypeKey)) {
        const licenceType = exports.getProperty("licenceTypes")
            .find(ele => ele.licenceTypeKey === licenceTypeKey);
        licenceTypeCache.set(licenceTypeKey, licenceType);
    }
    return licenceTypeCache.get(licenceTypeKey);
};
exports.getLicenceTypeKeyToNameObject = () => {
    if (Object.keys(licenceTypeKeyNameObject).length === 0) {
        let list = {};
        exports.getProperty("licenceTypes")
            .forEach((ele) => {
            if (ele.isActive) {
                list[ele.licenceTypeKey] = ele.licenceType;
            }
        });
        licenceTypeKeyNameObject = list;
    }
    return licenceTypeKeyNameObject;
};
