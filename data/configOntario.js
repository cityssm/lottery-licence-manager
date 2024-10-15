import { ticketTypes as nevadaTicketTypes } from '@cityssm/agco-break-open-ticket-types';
export const config = {};
config.defaults = {
    city: '',
    province: 'ON',
    countryCode: 'CA'
};
config.reminderCategories = [
    {
        reminderCategory: 'Annual Eligibility Documents',
        categoryDescription: "To be submitted at the beginning on an organization's fiscal year.",
        isActive: true,
        reminderTypes: [
            {
                reminderTypeKey: 'DOC_MANDATE',
                reminderType: 'Organization Mandate',
                reminderStatuses: ['Received', 'Not Applicable'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: false,
                isActive: true
            },
            {
                reminderTypeKey: 'DOC_BOARD',
                reminderType: 'Board of Directors List',
                reminderStatuses: ['Received', 'Incomplete'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            },
            {
                reminderTypeKey: 'DOC_BUDGET',
                reminderType: 'Projected Budget',
                reminderStatuses: ['Received', 'Incomplete'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            },
            {
                reminderTypeKey: 'DOC_FINSTMT',
                reminderType: 'Financial Statement',
                reminderStatuses: ['Received', 'Incomplete'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            },
            {
                reminderTypeKey: 'DOC_MEMBERS',
                reminderType: 'Bona Fide Members List',
                reminderStatuses: ['Received', 'Incomplete', 'Not Applicable'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            },
            {
                reminderTypeKey: 'DOC_ROSTER',
                reminderType: 'Team Roster',
                reminderStatuses: ['Received', 'Incomplete', 'Not Applicable'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            },
            {
                reminderTypeKey: 'DOC_SCHOOLBD',
                reminderType: 'School Board Budget',
                reminderStatuses: ['Received', 'Incomplete', 'Not Applicable'],
                hasUndismissedLimit: true,
                isBasedOnFiscalYear: true,
                isActive: true
            }
        ]
    },
    {
        reminderCategory: 'Other Reminders',
        isActive: true,
        reminderTypes: [
            {
                reminderTypeKey: 'OTHER',
                reminderType: 'Reminder',
                reminderStatuses: ['Dismissed'],
                hasUndismissedLimit: false,
                isBasedOnFiscalYear: false,
                isActive: true
            }
        ]
    }
];
config.licences = {
    feeCalculationFn: (licenceObject) => {
        const totalPrizeValue = licenceObject.totalPrizeValue || 0;
        const licenceFeeMin = 10;
        const calculatedLicenceFee = totalPrizeValue * 0.03;
        const fee = Math.max(licenceFeeMin, calculatedLicenceFee);
        const message = fee === licenceFeeMin
            ? 'Base minimum licence fee.'
            : '3% of $' + licenceObject.totalPrizeValue.toFixed(2);
        const licenceHasErrors = false;
        return {
            fee: fee.toFixed(2),
            message,
            licenceHasErrors
        };
    },
    printTemplate: 'licence-print-agco.ejs',
    externalLicenceNumber: {
        fieldLabel: 'Municipal Licence Number',
        isPreferredID: true
    }
};
config.licenceTypes = [
    {
        licenceTypeKey: 'BA',
        licenceType: 'Bazaar',
        totalPrizeValueMax: 5500,
        isActive: true,
        licenceFields: [
            {
                fieldKey: 'wheelCount',
                fieldLabel: 'Number of Wheels',
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 100,
                    step: 1
                }
            }
        ],
        eventFields: []
    },
    {
        licenceTypeKey: 'BI',
        licenceType: 'Bingo',
        isActive: true,
        totalPrizeValueMax: 5500,
        licenceFields: [],
        eventFields: [
            {
                fieldKey: 'playerCount',
                fieldLabel: 'Number of Players',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 1
                }
            },
            {
                fieldKey: 'cardsCount',
                fieldLabel: 'Number of Cards Sold',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 100_000,
                    step: 1
                }
            },
            {
                fieldKey: 'hallRentalCost',
                fieldLabel: 'Hall Rental',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'honorariumCost',
                fieldLabel: 'Honorariums',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'otherCost',
                fieldLabel: 'Other Costs',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            }
        ]
    },
    {
        licenceTypeKey: 'NV',
        licenceType: 'Nevada',
        totalPrizeValueMax: 300_000,
        isActive: true,
        ticketTypes: Object.values(nevadaTicketTypes),
        licenceFields: [],
        eventFields: [
            {
                fieldKey: 'retailerCommission',
                fieldLabel: 'Retailer Commission',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'retailerHST',
                fieldLabel: 'Retailer HST',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'distributorCommission',
                fieldLabel: 'Distributor Commission',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'distributorHST',
                fieldLabel: 'Distributor HST',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'accFee',
                fieldLabel: 'Acc Fee',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'boxCount',
                fieldLabel: 'Number of Boxes',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 1000,
                    step: 1
                }
            },
            {
                fieldKey: 'boxCost',
                fieldLabel: 'Cost per Box',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 10_000,
                    step: 0.01
                }
            }
        ],
        printSettings: {
            agco_hideTotalPrizeValue: true,
            agco_useLicenceDatesAsEventDates: true,
            agco_hideTimes: true
        }
    },
    {
        licenceTypeKey: 'RA',
        licenceType: 'Raffle',
        totalPrizeValueMax: 50_000,
        isActive: true,
        licenceFields: [
            {
                fieldKey: 'drawCount',
                fieldLabel: 'Number of Draws',
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 1000,
                    step: 1
                }
            },
            {
                fieldKey: 'ticketCount',
                fieldLabel: 'Number of Tickets',
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 1_000_000,
                    step: 1
                }
            },
            {
                fieldKey: 'ticketCost',
                fieldLabel: 'Cost Per Ticket',
                isActive: true,
                isShownOnEvent: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 1000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'discount1_tickets',
                fieldLabel: 'Discount 1 - Number of Tickets',
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 50,
                    step: 1
                }
            },
            {
                fieldKey: 'discount1_cost',
                fieldLabel: 'Discount 1 - Cost',
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 2000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'discount2_tickets',
                fieldLabel: 'Discount 2 - Number of Tickets',
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 50,
                    step: 1
                }
            },
            {
                fieldKey: 'discount2_cost',
                fieldLabel: 'Discount 2 - Cost',
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 2000,
                    step: 0.01
                }
            },
            {
                fieldKey: 'discount3_tickets',
                fieldLabel: 'Discount 3 - Number of Tickets',
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 50,
                    step: 1
                }
            },
            {
                fieldKey: 'discount3_cost',
                fieldLabel: 'Discount 3 - Cost',
                isActive: true,
                isShownOnEvent: false,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 2000,
                    step: 0.01
                }
            }
        ],
        eventFields: [
            {
                fieldKey: 'ticketsSoldCount',
                fieldLabel: 'Tickets Sold',
                isActive: true,
                inputAttributes: {
                    type: 'number',
                    min: 0,
                    max: 1_000_000,
                    step: 1
                }
            }
        ],
        printSettings: {
            agco_useLicenceDatesAsEventDates: true,
            agco_additionalLicenceDetailsHTMLFn: (licenceObject) => {
                const drawCountField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-drawCount');
                const ticketCountField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-ticketCount');
                const ticketCostField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-ticketCost');
                const discountTicketsField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-discount1_tickets');
                const discountCostField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-discount1_cost');
                const discount2TicketsField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-discount2_tickets');
                const discount2CostField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-discount2_cost');
                const discount3TicketsField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-discount3_tickets');
                const discount3CostField = licenceObject.licenceFields.find((field) => field.fieldKey === 'RA-discount3_cost');
                return (drawCountField.fieldValue +
                    ' draw' +
                    (drawCountField.fieldValue === '1' ? '' : 's') +
                    '; ' +
                    (ticketCountField ? ticketCountField.fieldValue + ' tickets; ' : '') +
                    (ticketCostField && ticketCostField.fieldValue !== '0'
                        ? '$' + ticketCostField.fieldValue + ' per ticket; '
                        : '') +
                    (discountTicketsField && discountCostField
                        ? discountTicketsField.fieldValue +
                            ' for $' +
                            discountCostField.fieldValue +
                            '; '
                        : '') +
                    (discount2TicketsField && discount2CostField
                        ? discount2TicketsField.fieldValue +
                            ' for $' +
                            discount2CostField.fieldValue +
                            '; '
                        : '') +
                    (discount3TicketsField && discount3CostField
                        ? discount3TicketsField.fieldValue +
                            ' for $' +
                            discount3CostField.fieldValue +
                            '; '
                        : ''));
            }
        }
    }
];
export default config;
