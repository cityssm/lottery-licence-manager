import { config as configOntario } from "./configOntario.js";

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


export default config;
