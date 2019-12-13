/* global module, require */


let stringFns = {

  escapeHTML: function(str) {
    "use strict";

    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },

  rawToCSV: function(rowsColumnsObj) {
    "use strict";

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
