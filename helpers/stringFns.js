/* global module, require */

"use strict";


const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;


const stringFns = {

  escapeHTML: function(str) {

    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  },

  rawToCSV: function(rowsColumnsObj) {

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


module.exports = stringFns;
