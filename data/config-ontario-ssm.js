"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const objectFns = __importStar(require("../helpers/objectFns"));
const configOntario = __importStar(require("./config-ontario"));
const configSSM = Object.assign({}, configOntario);
configSSM.application = {
    applicationName: "SSM Lottery Licence Manager"
};
configSSM.session = {
    doKeepAlive: true
};
configSSM.defaults.city = "Sault Ste. Marie";
configSSM.licences.externalLicenceNumber.newCalculation = "range";
configSSM.licences.externalReceiptNumber = {
    fieldLabel: "GP Receipt Number"
};
configSSM.licences.feeCalculationFn = function (licenceObj) {
    const totalPrizeValue = (licenceObj.totalPrizeValue || 0.0);
    const licenceFeeMin = 10;
    const calculatedLicenceFee = totalPrizeValue * 0.03;
    let fee = Math.max(licenceFeeMin, calculatedLicenceFee);
    let message = (fee === licenceFeeMin ?
        "Base minimum licence fee." :
        "3% of $" + licenceObj.totalPrizeValue.toFixed(2));
    let licenceHasErrors = false;
    if (licenceObj.licenceTypeKey === "BI") {
        fee = totalPrizeValue * 0.03 * licenceObj.events.length;
        message = "3% of $" + licenceObj.totalPrizeValue.toFixed(2) + " times " + licenceObj.events.length + " events";
    }
    else if (licenceObj.licenceTypeKey === "RA") {
        const licenceFieldData = objectFns.fieldDataArrayToObject(licenceObj.licenceFields);
        let ticketCost = parseFloat(licenceFieldData.ticketCost || "0");
        if (licenceFieldData.discount1_tickets !== "" && licenceFieldData.discount1_cost !== "") {
            const discountTicketCost = parseFloat(licenceFieldData.discount1_cost) / parseInt(licenceFieldData.discount1_tickets, 10);
            ticketCost = Math.min(ticketCost, discountTicketCost);
        }
        if (licenceFieldData.discount2_tickets !== "" && licenceFieldData.discount2_cost !== "") {
            const discountTicketCost = parseFloat(licenceFieldData.discount2_cost) / parseInt(licenceFieldData.discount2_tickets, 10);
            ticketCost = Math.min(ticketCost, discountTicketCost);
        }
        if (licenceFieldData.discount3_tickets !== "" && licenceFieldData.discount3_cost !== "") {
            const discountTicketCost = parseFloat(licenceFieldData.discount3_cost) / parseInt(licenceFieldData.discount3_tickets, 10);
            ticketCost = Math.min(ticketCost, discountTicketCost);
        }
        const minPotentialTakeIn = ticketCost * parseInt(licenceFieldData.ticketCount || "0", 10);
        const minPrizeValue = minPotentialTakeIn * 0.2;
        if (totalPrizeValue < minPrizeValue) {
            licenceHasErrors = true;
            message = "Total Prize Value must be a minimum of $" + minPrizeValue + ".";
        }
    }
    return {
        fee: fee.toFixed(2),
        message: message,
        licenceHasErrors: licenceHasErrors
    };
};
const licenceTypeNevada = configSSM.licenceTypes.find(licenceType => licenceType.licenceTypeKey === "NV");
for (let ticketTypeIndex = 0; ticketTypeIndex < licenceTypeNevada.ticketTypes.length; ticketTypeIndex += 1) {
    licenceTypeNevada.ticketTypes[ticketTypeIndex].feePerUnit =
        Math.round(licenceTypeNevada.ticketTypes[ticketTypeIndex].prizesPerDeal * 0.03 * 100) / 100;
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
            max: 1000000,
            step: 1
        }
    }
];
module.exports = configSSM;
