import { FieldData } from "../helpers/llmTypes";


export function fieldDataArrayToObject(fieldDataArray: FieldData[]): any {

  const fieldDataObject = {};

  for (let i = 0; i < fieldDataArray.length; i += 1) {

    const fieldData = fieldDataArray[i];

    fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue;
  }

  return fieldDataObject;
}
