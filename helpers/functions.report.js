import * as configFunctions from "./functions.config.js";
export const userFn_reminderTypeKeyToReminderType = (reminderTypeKey) => {
    const reminderTypeDefinition = configFunctions.getReminderType(reminderTypeKey);
    return (reminderTypeDefinition
        ? reminderTypeDefinition.reminderType
        : undefined);
};
export const userFn_licenceTypeKeyToLicenceType = (licenceTypeKey) => {
    const licenceTypeDefinition = configFunctions.getLicenceType(licenceTypeKey);
    return (licenceTypeDefinition
        ? licenceTypeDefinition.licenceType
        : undefined);
};
export const userFn_ticketTypeField = (licenceTypeKey, ticketTypeKey, fieldName) => {
    const licenceType = configFunctions.getLicenceType(licenceTypeKey);
    if (!licenceType) {
        return undefined;
    }
    const ticketType = (licenceType.ticketTypes || []).find((element) => element.ticketType === ticketTypeKey);
    if (!ticketType) {
        return undefined;
    }
    return ticketType[fieldName];
};
