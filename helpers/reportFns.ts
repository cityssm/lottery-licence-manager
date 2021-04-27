import * as configFns from "./configFns.js";

import type * as configTypes from "../types/configTypes";


export const userFn_reminderTypeKeyToReminderType = (reminderTypeKey: string) => {

  const reminderTypeDef = configFns.getReminderType(reminderTypeKey);

  return (reminderTypeDef
    ? reminderTypeDef.reminderType
    : null);
};


export const userFn_licenceTypeKeyToLicenceType = (licenceTypeKey: string) => {

  const licenceTypeDef = configFns.getLicenceType(licenceTypeKey);

  return (licenceTypeDef
    ? licenceTypeDef.licenceType
    : null);
};


export const userFn_ticketTypeField = (licenceTypeKey: string,
  ticketTypeKey: string,
  fieldName: "ticketPrice" | "ticketCount" | "prizesPerDeal" | "feePerUnit") => {

  const licenceType = configFns.getLicenceType(licenceTypeKey);

  if (!licenceType) {
    return null;
  }

  const ticketType: configTypes.ConfigTicketType = (licenceType.ticketTypes || []).find((ele) => ele.ticketType === ticketTypeKey);

  if (!ticketType) {
    return null;
  }

  return ticketType[fieldName];
};
