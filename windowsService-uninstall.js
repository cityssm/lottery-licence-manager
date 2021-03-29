"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_windows_1 = require("node-windows");
const windowsService_1 = require("./windowsService");
const svc = new node_windows_1.Service(windowsService_1.serviceConfig);
svc.on("uninstall", function () {
    console.log("Uninstall complete.");
    console.log("The service exists: ", svc.exists);
});
svc.uninstall();
