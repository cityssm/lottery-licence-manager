import { FieldData } from "../helpers/llmTypes";


export const fieldDataArrayToObject = (fieldDataArray: FieldData[]): any => {

  const fieldDataObject = {};

  for (const fieldData of fieldDataArray) {
    fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue;
  }

  return fieldDataObject;
};
