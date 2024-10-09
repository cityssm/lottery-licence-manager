import * as objectFunctions from "../helpers/functions.object.js";
import configOntario from "./configOntario.js";
export const config = Object.assign({}, configOntario);
config.application = {
    applicationName: "SSM Lottery Licence Manager"
};
config.session = {
    doKeepAlive: true
};
config.defaults.city = "Sault Ste. Marie";
config.reminders = {
    preferredSortOrder: "config",
    dismissingStatuses: ["Received", "Not Applicable", "Dismissed"]
};
config.licences.externalLicenceNumber.newCalculation = "range";
config.licences.externalReceiptNumber = {
    fieldLabel: "GP Receipt Number"
};
config.licences.feeCalculationFn = (licenceObject) => {
    const totalPrizeValue = (licenceObject.totalPrizeValue || 0);
    const licenceFeeMin = 10;
    const calculatedLicenceFee = totalPrizeValue * 0.03;
    let fee = Math.max(licenceFeeMin, calculatedLicenceFee);
    let message = (fee === licenceFeeMin
        ? "Base minimum licence fee."
        : "3% of $" + licenceObject.totalPrizeValue.toFixed(2));
    let licenceHasErrors = false;
    if (licenceObject.licenceTypeKey === "BI") {
        fee = totalPrizeValue * 0.03 * licenceObject.events.length;
        message = "3% of $" + licenceObject.totalPrizeValue.toFixed(2) +
            " times " + licenceObject.events.length.toString() + " events";
    }
    else if (licenceObject.licenceTypeKey === "RA") {
        const licenceFieldData = objectFunctions.fieldDataArrayToObject(licenceObject.licenceFields);
        let ticketCost = Number.parseFloat(licenceFieldData.ticketCost || "0");
        if (licenceFieldData.discount1_tickets !== "" && licenceFieldData.discount1_cost !== "") {
            const discountTicketCost = Number.parseFloat(licenceFieldData.discount1_cost) / Number.parseInt(licenceFieldData.discount1_tickets, 10);
            ticketCost = Math.min(ticketCost, discountTicketCost);
        }
        if (licenceFieldData.discount2_tickets !== "" && licenceFieldData.discount2_cost !== "") {
            const discountTicketCost = Number.parseFloat(licenceFieldData.discount2_cost) / Number.parseInt(licenceFieldData.discount2_tickets, 10);
            ticketCost = Math.min(ticketCost, discountTicketCost);
        }
        if (licenceFieldData.discount3_tickets !== "" && licenceFieldData.discount3_cost !== "") {
            const discountTicketCost = Number.parseFloat(licenceFieldData.discount3_cost) / Number.parseInt(licenceFieldData.discount3_tickets, 10);
            ticketCost = Math.min(ticketCost, discountTicketCost);
        }
        const minPotentialTakeIn = ticketCost * Number.parseInt(licenceFieldData.ticketCount || "0", 10);
        const minPrizeValue = minPotentialTakeIn * 0.2;
        if (totalPrizeValue < minPrizeValue) {
            licenceHasErrors = true;
            message = "Total Prize Value must be a minimum of $" + minPrizeValue.toFixed(2) + ".";
        }
    }
    return {
        fee: fee.toFixed(2),
        message,
        licenceHasErrors
    };
};
const licenceTypeNevada = config.licenceTypes.find((licenceType) => licenceType.licenceTypeKey === "NV");
for (const nevadaTicketType of licenceTypeNevada.ticketTypes) {
    nevadaTicketType.feePerUnit = Math.round(nevadaTicketType.prizesPerDeal * 0.03 * 100) / 100;
}
licenceTypeNevada.licenceFields = [
    {
        fieldKey: "distributor",
        fieldLabel: "Distributor",
        isActive: false,
        isShownOnEvent: false,
        inputAttributes: {
            type: "text",
            maxlength: 100
        }
    },
    {
        fieldKey: "manufacturer",
        fieldLabel: "Manufacturer",
        isActive: false,
        isShownOnEvent: false,
        inputAttributes: {
            type: "text",
            maxlength: 100
        }
    },
    {
        fieldKey: "units",
        fieldLabel: "Units",
        isActive: false,
        isShownOnEvent: true,
        inputAttributes: {
            type: "number",
            min: 0,
            max: 1_000_000,
            step: 1
        }
    }
];
export default config;
