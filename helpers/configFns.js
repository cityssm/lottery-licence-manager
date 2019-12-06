/* global require, module, console */


let config;

try {
  config = require("../data/config");
} catch (e) {
  config = {};

  // eslint-disable-next-line no-console
  console.log("No \"config.js\" found.  To customize, create your own \"config.js\" in the \"data\" folder.  See \"config-example.js\" to get started.");
}


const configFallbackValues = {
  "application.applicationName": "Lottery Licence System",
  "application.logoURL": "/images/bingoBalls.png",
  "application.port": 3000,

  "user.createUpdateWindowMillis": 60 * 60 * 1000,
  "user.defaultProperties": {
    canCreate: "false",
    canUpdate: "false",
    isAdmin: "false"
  },

  "defaults.city": "",
  "defaults.province": "ON",

  "licences.externalLicenceNumber.fieldLabel": "External Licence Number",
  "licences.externalLicenceNumber.newCalculation": "",

  "licences.feeCalculationFn": function() {
    "use strict";
    return {
      fee: 10,
      message: "Using base licence fee.",
      licenceHsErrors: false
    };
  },

  "licences.printTemplate": "licence-print",

  "licenceTypes": []
};


function getProperty(propertyName) {
  "use strict";

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


let configFns = {

  getProperty: getProperty,

  getLicenceType: function(licenceTypeKey) {
    "use strict";

    const licenceTypes = getProperty("licenceTypes");

    for (let index = 0; index < licenceTypes.length; index += 1) {
      if (licenceTypes[index].licenceTypeKey === licenceTypeKey) {
        return licenceTypes[index];
      }
    }

    return null;
  },

  config: config
};

module.exports = configFns;
