import * as llm from "../helpers/llmTypes";

import * as objectFns from "../helpers/objectFns";

import * as configOntario from "./config-ontario";


const configSSM: llm.Config = Object.assign ({}, configOntario);


/*
 * APPLICATION SETTINGS
 */

configSSM.application = {
  applicationName: "SSM Lottery Licence Manager"
};


configSSM.session = {
  doKeepAlive: true
};


/*
 * DEFAULT VALUES
 */

configSSM.defaults.city = "Sault Ste. Marie";


/*
 * LICENCE SETTINGS
 */

configSSM.licences.externalLicenceNumber.newCalculation = "range";


configSSM.licences.externalReceiptNumber = {
  fieldLabel: "GP Receipt Number"
};

configSSM.licences.feeCalculationFn = (licenceObj: llm.LotteryLicence) => {

  const totalPrizeValue = (licenceObj.totalPrizeValue || 0.0);

  const licenceFeeMin = 10;

  const calculatedLicenceFee = totalPrizeValue * 0.03;

  let fee = Math.max(licenceFeeMin, calculatedLicenceFee);
  let message = (fee === licenceFeeMin ?
    "Base minimum licence fee." :
    "3% of $" + licenceObj.totalPrizeValue.toFixed(2));
  let licenceHasErrors = false;

  // Check the total prize value

  if (licenceObj.licenceTypeKey === "BI") {

    fee = totalPrizeValue * 0.03 * licenceObj.events.length;

    message = "3% of $" + licenceObj.totalPrizeValue.toFixed(2) + " times " + licenceObj.events.length + " events";

  } else if (licenceObj.licenceTypeKey === "RA") {

    const licenceFieldData = objectFns.fieldDataArrayToObject(licenceObj.licenceFields);

    // Get the minimum ticket cost

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

      const discountTicketCost =
        parseFloat(licenceFieldData.discount3_cost) / parseInt(licenceFieldData.discount3_tickets, 10);
      ticketCost = Math.min(ticketCost, discountTicketCost);

    }

    // Calculate the minimum prize value

    const minPotentialTakeIn =
      ticketCost * parseInt(licenceFieldData.ticketCount || "0", 10);

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


/*
 * SAULT STE MARIE SPECIFICS FOR NEVADA LICENSING
 */

const licenceTypeNevada = configSSM.licenceTypes.find(licenceType => licenceType.licenceTypeKey === "NV");


/*
 * For each ticket type, set a fee of 3% of the prizesPerDeal
 */

for (let ticketTypeIndex = 0; ticketTypeIndex < licenceTypeNevada.ticketTypes.length; ticketTypeIndex += 1) {

  licenceTypeNevada.ticketTypes[ticketTypeIndex].feePerUnit =
    Math.round(licenceTypeNevada.ticketTypes[ticketTypeIndex].prizesPerDeal * 0.03 * 100) / 100;

}


/*
 * Add additional inactive fields to Nevada licences
 * to handle older imported licences.
 */

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
