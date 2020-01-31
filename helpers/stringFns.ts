"use strict";

import { RawRowsColumnsReturn } from "./licencesDB";

const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;


export const stringFns = {

  escapeHTML: function(str : string) : string {

    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  },

  rawToCSV: function(rowsColumnsObj : RawRowsColumnsReturn) : string {

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
};
