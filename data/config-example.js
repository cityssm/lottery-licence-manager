/* global require, module */


const config = require("./config-ontario");


/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: "Lottery Licence Manager"
};



/*
 * DEFAULT VALUES
 */

config.defaults.city = "";



module.exports = config;
