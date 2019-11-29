/* global require, module */


let config;
try {
  config = require("../data/config");
} catch (e) {
  console.log("Using \"config-example.js\".  To customize, create your own \"config.js\" in the \"data\" folder.");
  config = require("../data/config-example");
}


let configFns = {

  getProperty: function(propertyName, fallbackValue) {
    "use strict";

    const propertyNameSplit = propertyName.split(".");

    let currentObj = config;

    for (let index = 0; index < propertyNameSplit.length; index += 1) {
      currentObj = currentObj[propertyNameSplit[index]];

      if (!currentObj) {
        return fallbackValue;
      }
    }

    return currentObj;
  },

  config: config
};

module.exports = configFns;
