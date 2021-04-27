import * as configFns from "./configFns.js";
export const userFn_reminderTypeKeyToReminderType = (reminderTypeKey) => {
    const reminderTypeDef = configFns.getReminderType(reminderTypeKey);
    return (reminderTypeDef
        ? reminderTypeDef.reminderType
        : null);
};
export const userFn_licenceTypeKeyToLicenceType = (licenceTypeKey) => {
    const licenceTypeDef = configFns.getLicenceType(licenceTypeKey);
    return (licenceTypeDef
        ? licenceTypeDef.licenceType
        : null);
};
export const userFn_ticketTypeField = (licenceTypeKey, ticketTypeKey, fieldName) => {
    const licenceType = configFns.getLicenceType(licenceTypeKey);
    if (!licenceType) {
        return null;
    }
    const ticketType = (licenceType.ticketTypes || []).find((ele) => ele.ticketType === ticketTypeKey);
    if (!ticketType) {
        return null;
    }
    return ticketType[fieldName];
};
