import { config as configOntario } from "./configOntario.js";
export const config = Object.assign({}, configOntario);
config.application = {
    applicationName: "Lottery Licence Manager",
    useTestDatabases: true
};
config.users = {
    testing: ["*testView", "*testUpdate", "*testAdmin"],
    canLogin: ["*testView", "*testUpdate", "*testAdmin"],
    canCreate: ["*testUpdate"],
    canUpdate: ["*testUpdate"],
    isAdmin: ["*testAdmin"]
};
config.defaults.city = "";
export default config;
