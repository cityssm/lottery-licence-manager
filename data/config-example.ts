import { config as configOntario } from "./config-ontario.js";

export const config = Object.assign({}, configOntario);


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
