#!/usr/bin/env node

import app from "../app";

import log from "fancy-log";

import http from "http";
import https from "https";
import fs from "fs";

import * as configFns from "../helpers/configFns";
import { ConfigHTTPS } from "../helpers/llmTypes";

function onError(error: Error) {

  if (error.syscall !== "listen") {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      log.error("Requires elevated privileges");
      process.exit(1);
    // break;

    case "EADDRINUSE":
      log.error("Port is already in use.");
      process.exit(1);
    // break;

    default:
      throw error;
  }
}

function onListening(server: http.Server | https.Server) {

  const addr = server.address();

  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;

  log.info("Listening on " + bind);

}

/**
 * Initialize HTTP
 */

const httpPort = configFns.getProperty("application.httpPort");

if (httpPort) {

  const httpServer = http.createServer(app);

  httpServer.listen(httpPort);

  httpServer.on("error", onError);
  httpServer.on("listening", function() {
    onListening(httpServer);
  });

  log.info("HTTP listening on " + httpPort);
}

/**
 * Initialize HTTPS
 */

const httpsConfig = <ConfigHTTPS>configFns.getProperty("application.https");

if (httpsConfig) {

  const httpsServer = https.createServer({
    key: fs.readFileSync(httpsConfig.keyPath),
    cert: fs.readFileSync(httpsConfig.certPath),
    passphrase: httpsConfig.passphrase
  }, app);

  httpsServer.listen(httpsConfig.port);

  httpsServer.on("error", onError);

  httpsServer.on("listening", function() {
    onListening(httpsServer);
  });

  log.info("HTTPS listening on " + httpsConfig.port);

}
