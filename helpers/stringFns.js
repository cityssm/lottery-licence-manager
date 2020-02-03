"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertArrayToCSV = require("convert-array-to-csv").convertArrayToCSV;
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
exports.escapeHTML = escapeHTML;
function rawToCSV(rowsColumnsObj) {
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
exports.rawToCSV = rawToCSV;
