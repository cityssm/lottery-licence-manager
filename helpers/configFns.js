"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLicenceTypeKeyToNameObject = exports.getLicenceType = exports.keepAliveMillis = exports.getProperty = void 0;
const config = __importStar(require("../data/config"));
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
    "licences.feeCalculationFn": function () {
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
function getProperty(propertyName) {
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
exports.getProperty = getProperty;
exports.keepAliveMillis = getProperty("session.doKeepAlive") ?
    Math.max(getProperty("session.maxAgeMillis") / 2, getProperty("session.maxAgeMillis") - (10 * 60 * 1000)) :
    0;
const licenceTypeCache = {};
let licenceTypeKeyNameObject = {};
function getLicenceType(licenceTypeKey) {
    if (!licenceTypeCache[licenceTypeKey]) {
        licenceTypeCache[licenceTypeKey] =
            getProperty("licenceTypes").find(function (ele) {
                return (ele.licenceTypeKey === licenceTypeKey);
            });
    }
    return licenceTypeCache[licenceTypeKey];
}
exports.getLicenceType = getLicenceType;
function getLicenceTypeKeyToNameObject() {
    if (Object.keys(licenceTypeKeyNameObject).length === 0) {
        let list = {};
        getProperty("licenceTypes").forEach(function (ele) {
            if (ele.isActive) {
                list[ele.licenceTypeKey] = ele.licenceType;
            }
        });
        licenceTypeKeyNameObject = list;
    }
    return licenceTypeKeyNameObject;
}
exports.getLicenceTypeKeyToNameObject = getLicenceTypeKeyToNameObject;
