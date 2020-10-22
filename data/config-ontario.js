"use strict";
const _agco_approvedBreakOpenTicketTypes_1 = require("./_agco-approvedBreakOpenTicketTypes");
const config = {};
config.defaults = {
    city: "",
    province: "ON"
};
config.reminderCategories = [
    {
        reminderCategory: "Annual Eligibility Documents",
        categoryDescription: "To be submitted at the beginning on an organization's fiscal year.",
        isActive: true,
        reminderTypes: [
            {
                reminderTypeKey: "DOC_MANDATE",
                reminderType: "Organization Mandate",
                reminderStatuses: ["Received", "Not Applicable"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: false,
                isActive: true
            }, {
                reminderTypeKey: "DOC_BOARD",
                reminderType: "Board of Directors List",
                reminderStatuses: ["Received", "Incomplete"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }, {
                reminderTypeKey: "DOC_BUDGET",
                reminderType: "Projected Budget",
                reminderStatuses: ["Received", "Incomplete"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }, {
                reminderTypeKey: "DOC_FINSTMT",
                reminderType: "Financial Statement",
                reminderStatuses: ["Received", "Incomplete"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }, {
                reminderTypeKey: "DOC_MEMBERS",
                reminderType: "Bona Fide Members List",
                reminderStatuses: ["Received", "Incomplete", "Not Applicable"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }, {
                reminderTypeKey: "DOC_ROSTER",
                reminderType: "Team Roster",
                reminderStatuses: ["Received", "Incomplete", "Not Applicable"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }, {
                reminderTypeKey: "DOC_SCHOOLBD",
                reminderType: "School Board Budget",
                reminderStatuses: ["Received", "Incomplete", "Not Applicable"],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }
        ]
    }, {
        reminderCategory: "Other Reminders",
        isActive: true,
        reminderTypes: [{
                reminderTypeKey: "OTHER",
                reminderType: "Reminder",
                reminderStatuses: ["Dismissed"],
                hasUndismissedLimit: false,
                isBasedOnFiscalYear: false,
                isActive: true
            }]
    }
];
config.licences = {
    feeCalculationFn: (licenceObj) => {
        const totalPrizeValue = (licenceObj.totalPrizeValue || 0.0);
        const licenceFeeMin = 10;
        const calculatedLicenceFee = totalPrizeValue * 0.03;
        const fee = Math.max(licenceFeeMin, calculatedLicenceFee);
        const message = (fee === licenceFeeMin
            ? "Base minimum licence fee."
            : "3% of $" + licenceObj.totalPrizeValue.toFixed(2));
        const licenceHasErrors = false;
        return {
            fee: fee.toFixed(2),
            message,
            licenceHasErrors
        };
    },
    printTemplate: "licence-print-agco.ejs",
    externalLicenceNumber: {
        fieldLabel: "Municipal Licence Number",
        isPreferredID: true
    }
};
config.licenceTypes = [
    {
        licenceTypeKey: "BA",
        licenceType: "Bazaar",
        totalPrizeValueMax: 5500,
        isActive: true,
        licenceFields: [{
                fieldKey: "wheelCount",
                fieldLabel: "Number of Wheels",
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 100,
                    step: 1
                }
            }],
        eventFields: []
    },
    {
        licenceTypeKey: "BI",
        licenceType: "Bingo",
        isActive: true,
        totalPrizeValueMax: 5500,
        licenceFields: [],
        eventFields: [{
                fieldKey: "playerCount",
                fieldLabel: "Number of Players",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000,
                    step: 1
                }
            }, {
                fieldKey: "cardsCount",
                fieldLabel: "Number of Cards Sold",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 100000,
                    step: 1
                }
            }, {
                fieldKey: "hallRentalCost",
                fieldLabel: "Hall Rental",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "honorariumCost",
                fieldLabel: "Honorariums",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "otherCost",
                fieldLabel: "Other Costs",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }
        ]
    },
    {
        licenceTypeKey: "NV",
        licenceType: "Nevada",
        totalPrizeValueMax: 300000,
        isActive: true,
        ticketTypes: _agco_approvedBreakOpenTicketTypes_1.ticketTypes,
        licenceFields: [],
        eventFields: [{
                fieldKey: "retailerCommission",
                fieldLabel: "Retailer Commission",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "retailerHST",
                fieldLabel: "Retailer HST",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "distributorCommission",
                fieldLabel: "Distributor Commission",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "distributorHST",
                fieldLabel: "Distributor HST",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "accFee",
                fieldLabel: "Acc Fee",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "boxCount",
                fieldLabel: "Number of Boxes",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 1000,
                    step: 1
                }
            }, {
                fieldKey: "boxCost",
                fieldLabel: "Cost per Box",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 10000.00,
                    step: 0.01
                }
            }],
        printSettings: {
            agco_hideTotalPrizeValue: true,
            agco_useLicenceDatesAsEventDates: true,
            agco_hideTimes: true
        }
    },
    {
        licenceTypeKey: "RA",
        licenceType: "Raffle",
        totalPrizeValueMax: 50000,
        isActive: true,
        licenceFields: [{
                fieldKey: "drawCount",
                fieldLabel: "Number of Draws",
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 1000,
                    step: 1
                }
            }, {
                fieldKey: "ticketCount",
                fieldLabel: "Number of Tickets",
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 1000000,
                    step: 1
                }
            }, {
                fieldKey: "ticketCost",
                fieldLabel: "Cost Per Ticket",
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: "number",
                    min: 0.00,
                    max: 1000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "discount1_tickets",
                fieldLabel: "Discount 1 - Number of Tickets",
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 50,
                    step: 1
                }
            }, {
                fieldKey: "discount1_cost",
                fieldLabel: "Discount 1 - Cost",
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: "number",
                    min: 0.00,
                    max: 2000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "discount2_tickets",
                fieldLabel: "Discount 2 - Number of Tickets",
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 50,
                    step: 1
                }
            }, {
                fieldKey: "discount2_cost",
                fieldLabel: "Discount 2 - Cost",
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: "number",
                    min: 0.00,
                    max: 2000.00,
                    step: 0.01
                }
            }, {
                fieldKey: "discount3_tickets",
                fieldLabel: "Discount 3 - Number of Tickets",
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 50,
                    step: 1
                }
            }, {
                fieldKey: "discount3_cost",
                fieldLabel: "Discount 3 - Cost",
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: "number",
                    min: 0.00,
                    max: 2000.00,
                    step: 0.01
                }
            }],
        eventFields: [{
                fieldKey: "ticketsSoldCount",
                fieldLabel: "Tickets Sold",
                isActive: true,
                inputAttributes: {
                    type: "number",
                    min: 0,
                    max: 1000000,
                    step: 1
                }
            }],
        printSettings: {
            agco_additionalLicenceDetailsHTMLFn: (licenceObj) => {
                const ticketCountField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-ticketCount");
                const ticketCostField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-ticketCost");
                const discountTicketsField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-discount1_tickets");
                const discountCostField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-discount1_cost");
                const discount2TicketsField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-discount2_tickets");
                const discount2CostField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-discount2_cost");
                const discount3TicketsField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-discount3_tickets");
                const discount3CostField = licenceObj.licenceFields.find((field) => field.fieldKey === "RA-discount3_cost");
                return (ticketCountField ? ticketCountField.fieldValue + " tickets; " : "") +
                    (ticketCostField ? "$" + ticketCostField.fieldValue + " per ticket; " : "") +
                    (discountTicketsField && discountCostField
                        ? discountTicketsField.fieldValue + " for $" + discountCostField.fieldValue + "; "
                        : "") +
                    (discount2TicketsField && discount2CostField
                        ? discount2TicketsField.fieldValue + " for $" + discount2CostField.fieldValue + "; "
                        : "") +
                    (discount3TicketsField && discount3CostField
                        ? discount3TicketsField.fieldValue + " for $" + discount3CostField.fieldValue + "; "
                        : "");
            }
        }
    }
];
module.exports = config;
