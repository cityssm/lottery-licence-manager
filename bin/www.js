#!/usr/bin/env node
import app from "../app.js";
import http from "http";
import https from "https";
import fs from "fs";
import * as configFns from "../helpers/configFns.js";
import debug from "debug";
const debugWWW = debug("lottery-licence-manager:www");
const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            debugWWW("Requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            debugWWW("Port is already in use.");
            process.exit(1);
        default:
            throw error;
    }
};
const onListening = (server) => {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr.port.toString();
    debugWWW("Listening on " + bind);
};
const httpPort = configFns.getProperty("application.httpPort");
if (httpPort) {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", () => {
        onListening(httpServer);
    });
    debugWWW("HTTP listening on " + httpPort.toString());
}
const httpsConfig = configFns.getProperty("application.https");
if (httpsConfig) {
    const httpsServer = https.createServer({
        key: fs.readFileSync(httpsConfig.keyPath),
        cert: fs.readFileSync(httpsConfig.certPath),
        passphrase: httpsConfig.passphrase
    }, app);
    httpsServer.listen(httpsConfig.port);
    httpsServer.on("error", onError);
    httpsServer.on("listening", () => {
        onListening(httpsServer);
    });
    debugWWW("HTTPS listening on " + httpsConfig.port.toString());
}
