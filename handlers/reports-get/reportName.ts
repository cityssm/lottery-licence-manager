import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";
import * as licencesDB from "../../helpers/licencesDB.js";
import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns.js";

import reportDefinitions from "../../helpers/reportDefinitions/reportDefinitions.js";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


export const handler: RequestHandler = (req, res) => {

  const reportName = req.params.reportName;

  let sql = "";
  let params = [];
  let functions = new Map<string, (...params: any) => any>();

  if (reportDefinitions[reportName]) {

    const def = reportDefinitions[reportName];
    sql = def.sql;

    if (def.params) {
      params = def.params(req);
    }

    if (def.functions) {
      functions = def.functions();
    }

  } else {
    res.redirect(urlPrefix + "/reports/?error=reportNotFound");
    return;
  }

  const rowsColumnsObj = licencesDB.getRawRowsColumns(sql, params, functions);

  const csv = rawToCSV(rowsColumnsObj);

  res.setHeader("Content-Disposition",
    "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");

  res.setHeader("Content-Type", "text/csv");

  res.send(csv);
};


export default handler;
