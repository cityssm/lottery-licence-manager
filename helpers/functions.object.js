export function fieldDataArrayToObject(fieldDataArray) {
    const fieldDataObject = {};
    for (const fieldData of fieldDataArray) {
        fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue;
    }
    return fieldDataObject;
}
