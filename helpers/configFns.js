/* global require, module, console */
/* eslint-disable no-console */


let config;
try {
  config = require("../data/config");
} catch (e) {
  config = {};
  console.log("No \"config.js\" found.  To customize, create your own \"config.js\" in the \"data\" folder.  See \"config-example.js\" to get started.");
}


const configFallbackValues = {
  "application.applicationName": "Lottery Licence System",
  "application.logoURL": "/images/bingoBalls.png",
  "application.port": 3000,

  "defaults.city": "",
  "defaults.province": "ON",

  "licences.externalLicenceNumber.fieldLabel": "External Licence Number",

  "licences.printTemplate": "licence-print",

  "licenceTypes": []
};


let configFns = {

  getProperty: function(propertyName) {
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
  },

  config: config
};

module.exports = configFns;
