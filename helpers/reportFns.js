import * as configFns from "./configFns.js";
export const userFn_reminderTypeKeyToReminderType = (reminderTypeKey) => {
    const reminderTypeDef = configFns.getReminderType(reminderTypeKey);
    return (reminderTypeDef
        ? reminderTypeDef.reminderType
        : undefined);
};
export const userFn_licenceTypeKeyToLicenceType = (licenceTypeKey) => {
    const licenceTypeDef = configFns.getLicenceType(licenceTypeKey);
    return (licenceTypeDef
        ? licenceTypeDef.licenceType
        : undefined);
};
export const userFn_ticketTypeField = (licenceTypeKey, ticketTypeKey, fieldName) => {
    const licenceType = configFns.getLicenceType(licenceTypeKey);
    if (!licenceType) {
        return undefined;
    }
    const ticketType = (licenceType.ticketTypes || []).find((ele) => ele.ticketType === ticketTypeKey);
    if (!ticketType) {
        return undefined;
    }
    return ticketType[fieldName];
};
