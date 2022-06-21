import { config as configOntario } from "./configOntario.js";

export const config = Object.assign({}, configOntario);


/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: "Lottery Licence Manager"
};


config.users = {
  testing: ["*testView", "*testUpdate", "*testAdmin"],
  canLogin: ["*testView", "*testUpdate", "*testAdmin"],
  canCreate: ["*testUpdate"],
  canUpdate: ["*testUpdate"],
  isAdmin: ["*testAdmin"]
};

/*
 * DEFAULT VALUES
 */

config.defaults.city = "";


export default config;
