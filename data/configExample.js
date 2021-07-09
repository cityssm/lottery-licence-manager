import { config as configOntario } from "./configOntario.js";
export const config = Object.assign({}, configOntario);
config.application = {
    applicationName: "Lottery Licence Manager"
};
config.admin = {
    defaultPassword: ""
};
config.defaults.city = "";
export default config;
