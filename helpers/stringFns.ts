"use strict";

import { RawRowsColumnsReturn } from "./llmTypes";

const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;


export function escapeHTML(str: string): string {

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

}

export function rawToCSV(rowsColumnsObj: RawRowsColumnsReturn): string {

  const columnNames = new Array(rowsColumnsObj.columns.length);

  for (let columnIndex = 0; columnIndex < rowsColumnsObj.columns.length; columnIndex += 1) {

    columnNames[columnIndex] = rowsColumnsObj.columns[columnIndex].name;

  }

  const csv = convertArrayToCSV(rowsColumnsObj.rows, {
    header: columnNames,
    separator: ","
  });

  return csv;

}


/*
 * UID GENERATOR
 */

let uid = Date.now();

export function getUID() {

  const toReturn = uid;

  uid += 1;

  return "uid" + toReturn.toString();

}
