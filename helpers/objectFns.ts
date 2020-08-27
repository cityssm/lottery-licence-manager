import { FieldData } from "../types/recordTypes";


export const fieldDataArrayToObject = (fieldDataArray: FieldData[]): { [fieldKey: string]: string } => {

  const fieldDataObject: { [fieldKey: string]: string } = {};

  for (const fieldData of fieldDataArray) {
    fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue;
  }

  return fieldDataObject;
};
