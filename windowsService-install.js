"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_windows_1 = require("node-windows");
const path = require("path");
const svc = new node_windows_1.Service({
    name: "Lottery Licence Manager",
    description: "A web application for managing AGCO's municipal lottery licensing requirements in Ontario.",
    script: path.join(__dirname, "bin", "www.js")
});
svc.on("install", () => {
    svc.start();
});
svc.install();
