"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceConfig = void 0;
const path = require("path");
exports.serviceConfig = {
    name: "Lottery Licence Manager",
    description: "A web application for managing AGCO's municipal lottery licensing requirements in Ontario.",
    script: path.join(__dirname, "bin", "www.js")
};
