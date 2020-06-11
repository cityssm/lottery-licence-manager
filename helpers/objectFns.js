"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldDataArrayToObject = void 0;
function fieldDataArrayToObject(fieldDataArray) {
    const fieldDataObject = {};
    for (let i = 0; i < fieldDataArray.length; i += 1) {
        const fieldData = fieldDataArray[i];
        fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue;
    }
    return fieldDataObject;
}
exports.fieldDataArrayToObject = fieldDataArrayToObject;
