/* global require, module */

"use strict";


const config = require("./config-ontario");


/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: "Lottery Licence Manager"
};


/*
 * ADMIN SETTINGS
 */


config.admin = {
  defaultPassword: ""
};


/*
 * DEFAULT VALUES
 */

config.defaults.city = "";


module.exports = config;
