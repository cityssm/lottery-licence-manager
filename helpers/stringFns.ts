"use strict";

import sqlite = require("better-sqlite3");

const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;


type RawRowsColumnsReturn = {
  rows: object[],
  columns: sqlite.ColumnDefinition[]
};


const stringFns = {

  escapeHTML: function(str : string) {

    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  },

  rawToCSV: function(rowsColumnsObj : RawRowsColumnsReturn) {

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


exports = stringFns;
