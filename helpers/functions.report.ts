// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/naming-convention, unicorn/prevent-abbreviations */

import type * as configTypes from '../types/configTypes.js'

import * as configFunctions from './functions.config.js'

export const userFn_reminderTypeKeyToReminderType = (
  reminderTypeKey: string
): string => {
  const reminderTypeDefinition =
    configFunctions.getReminderType(reminderTypeKey)

  return reminderTypeDefinition
    ? reminderTypeDefinition.reminderType
    : undefined
}

export const userFn_licenceTypeKeyToLicenceType = (
  licenceTypeKey: string
): string => {
  const licenceTypeDefinition = configFunctions.getLicenceType(licenceTypeKey)

  return licenceTypeDefinition ? licenceTypeDefinition.licenceType : undefined
}

export const userFn_ticketTypeField = (
  licenceTypeKey: string,
  ticketTypeKey: string,
  fieldName: 'ticketPrice' | 'ticketCount' | 'prizesPerDeal' | 'feePerUnit'
): unknown => {
  const licenceType = configFunctions.getLicenceType(licenceTypeKey)

  if (!licenceType) {
    return undefined
  }

  const ticketType: configTypes.ConfigTicketType = (
    licenceType.ticketTypes || []
  ).find((element) => element.ticketType === ticketTypeKey)

  if (!ticketType) {
    return undefined
  }

  return ticketType[fieldName]
}
