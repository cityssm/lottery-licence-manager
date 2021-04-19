import * as configOntario from "./config-ontario";
export const config = Object.assign({}, configOntario);
config.application = {
    applicationName: "Lottery Licence Manager"
};
config.admin = {
    defaultPassword: ""
};
config.defaults.city = "";
