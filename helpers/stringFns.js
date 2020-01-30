"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;
var stringFns = {
    escapeHTML: function (str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    },
    rawToCSV: function (rowsColumnsObj) {
        var columnNames = new Array(rowsColumnsObj.columns.length);
        for (var columnIndex = 0; columnIndex < rowsColumnsObj.columns.length; columnIndex += 1) {
            columnNames[columnIndex] = rowsColumnsObj.columns[columnIndex].name;
        }
        var csv = convertArrayToCSV(rowsColumnsObj.rows, {
            header: columnNames,
            separator: ","
        });
        return csv;
    }
};
exports = stringFns;
