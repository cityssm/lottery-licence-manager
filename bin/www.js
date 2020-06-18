#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const debug_1 = __importDefault(require("debug"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const configFns = __importStar(require("../helpers/configFns"));
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            console.error("Requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.error("Port is already in use.");
            process.exit(1);
        default:
            throw error;
    }
}
function onListening(server) {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port;
    debug_1.default("Listening on " + bind);
}
const httpPort = configFns.getProperty("application.httpPort");
if (httpPort) {
    const httpServer = http_1.default.createServer(app_1.default);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", function () {
        onListening(httpServer);
    });
    console.log("HTTP listening on " + httpPort);
}
const httpsConfig = configFns.getProperty("application.https");
if (httpsConfig) {
    const httpsServer = https_1.default.createServer({
        key: fs_1.default.readFileSync(httpsConfig.keyPath),
        cert: fs_1.default.readFileSync(httpsConfig.certPath),
        passphrase: httpsConfig.passphrase
    }, app_1.default);
    httpsServer.listen(httpsConfig.port);
    httpsServer.on("error", onError);
    httpsServer.on("listening", function () {
        onListening(httpsServer);
    });
    console.log("HTTPS listening on " + httpsConfig.port);
}
