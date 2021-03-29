#!/usr/bin/env node

import * as app from "../app";

import * as http from "http";
import * as https from "https";
import * as fs from "fs";

import * as configFns from "../helpers/configFns";

import { debug } from "debug";
const debugWWW = debug("lottery-licence-manager:www");


interface ServerError extends Error {
  syscall: string;
  code: string;
}

const onError = (error: ServerError) => {

  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {

    // eslint-disable-next-line no-fallthrough
    case "EACCES":
      debugWWW("Requires elevated privileges");
      process.exit(1);
    // break;

    // eslint-disable-next-line no-fallthrough
    case "EADDRINUSE":
      debugWWW("Port is already in use.");
      process.exit(1);
    // break;

    // eslint-disable-next-line no-fallthrough
    default:
      throw error;
  }
};

const onListening = (server: http.Server | https.Server) => {

  const addr = server.address();

  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port.toString();

  debugWWW("Listening on " + bind);
};

/**
 * Initialize HTTP
 */

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

/**
 * Initialize HTTPS
 */

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
