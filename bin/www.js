import { app } from "../app.js";
import http from "http";
import https from "https";
import fs from "fs";
import * as configFunctions from "../helpers/functions.config.js";
import exitHook from "exit-hook";
import debug from "debug";
const debugWWW = debug("lottery-licence-manager:www");
let httpServer;
let httpsServer;
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
const httpPort = configFunctions.getProperty("application.httpPort");
if (httpPort) {
    httpServer = http.createServer(app);
    httpServer.listen(httpPort);
    httpServer.on("error", onError);
    httpServer.on("listening", () => {
        onListening(httpServer);
    });
    debugWWW("HTTP listening on " + httpPort.toString());
}
const httpsConfig = configFunctions.getProperty("application.https");
if (httpsConfig) {
    httpsServer = https.createServer({
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
exitHook(() => {
    if (httpServer) {
        debugWWW("Closing HTTP");
        httpServer.close();
        httpServer = undefined;
    }
    if (httpsServer) {
        debugWWW("Closing HTTPS");
        httpsServer.close();
        httpsServer = undefined;
    }
});
