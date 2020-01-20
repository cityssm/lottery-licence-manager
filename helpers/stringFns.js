/* global module, require */

"use strict";


let stringFns = {

  escapeHTML: function(str) {

    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  },

  rawToCSV: function(rowsColumnsObj) {

    let columnNames = new Array(rowsColumnsObj.columns.length);

    for (let columnIndex = 0; columnIndex < rowsColumnsObj.columns.length; columnIndex += 1) {

      columnNames[columnIndex] = rowsColumnsObj.columns[columnIndex].name;

    }

    const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;

    const csv = convertArrayToCSV(rowsColumnsObj.rows, {
      header: columnNames,
      separator: ","
    });

    return csv;

  }
};


module.exports = stringFns;
