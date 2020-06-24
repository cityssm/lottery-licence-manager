"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configOntario = require("./config-ontario");
const config = Object.assign({}, configOntario);
config.application = {
    applicationName: "Lottery Licence Manager"
};
config.admin = {
    defaultPassword: ""
};
config.defaults.city = "";
module.exports = config;
