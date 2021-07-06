import * as configFns from "./configFns.js";

import type * as configTypes from "../types/configTypes";


export const userFn_reminderTypeKeyToReminderType = (reminderTypeKey: string): string => {

  const reminderTypeDef = configFns.getReminderType(reminderTypeKey);

  return (reminderTypeDef
    ? reminderTypeDef.reminderType
    : undefined);
};


export const userFn_licenceTypeKeyToLicenceType = (licenceTypeKey: string): string => {

  const licenceTypeDef = configFns.getLicenceType(licenceTypeKey);

  return (licenceTypeDef
    ? licenceTypeDef.licenceType
    : undefined);
};


export const userFn_ticketTypeField = (licenceTypeKey: string,
  ticketTypeKey: string,
  fieldName: "ticketPrice" | "ticketCount" | "prizesPerDeal" | "feePerUnit"): unknown => {

  const licenceType = configFns.getLicenceType(licenceTypeKey);

  if (!licenceType) {
    return undefined;
  }

  const ticketType: configTypes.ConfigTicketType = (licenceType.ticketTypes || []).find((ele) => ele.ticketType === ticketTypeKey);

  if (!ticketType) {
    return undefined;
  }

  return ticketType[fieldName];
};
