"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldDataArrayToObject = void 0;
function fieldDataArrayToObject(fieldDataArray) {
    const fieldDataObject = {};
    for (const fieldData of fieldDataArray) {
        fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue;
    }
    return fieldDataObject;
}
exports.fieldDataArrayToObject = fieldDataArrayToObject;
