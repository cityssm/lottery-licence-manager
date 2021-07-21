import type { RequestHandler } from "express";

import * as configFunctions from "../../helpers/functions.config.js";
import * as licencesDB from "../../helpers/licencesDB.js";
import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns.js";

import { reportDefinitions } from "../../helpers/reportDefinitions/reportDefinitions.js";


const urlPrefix = configFunctions.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (request, response) => {

  const reportName = request.params.reportName;

  if (!reportDefinitions[reportName]) {
    response.redirect(urlPrefix + "/reports/?error=reportNotFound");
    return;
  }

  const definition = reportDefinitions[reportName];

  const sql = definition.sql;

  const parameters = definition.params
    ? definition.params(request)
    : [];

  const functions = definition.functions
    ? definition.functions()
    : new Map<string, (...parameters_: unknown[]) => unknown>();


  const rowsColumnsObject = licencesDB.getRawRowsColumns(sql, parameters, functions);

  const csv = rawToCSV(rowsColumnsObject);

  response.setHeader("Content-Disposition",
    "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");

  response.setHeader("Content-Type", "text/csv");

  response.send(csv);
};


export default handler;
