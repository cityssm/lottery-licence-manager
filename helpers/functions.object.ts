import type { FieldData } from '../types/recordTypes'

export function fieldDataArrayToObject(fieldDataArray: FieldData[]): {
  [fieldKey: string]: string
} {
  const fieldDataObject: { [fieldKey: string]: string } = {}

  for (const fieldData of fieldDataArray) {
    fieldDataObject[fieldData.fieldKey] = fieldData.fieldValue
  }

  return fieldDataObject
}
