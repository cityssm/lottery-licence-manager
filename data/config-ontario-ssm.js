/* global require, module */

"use strict";

const config = require("./config-ontario");


/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: "SSM Lottery Licence Manager"
};


/*
 * DEFAULT VALUES
 */

config.defaults.city = "Sault Ste. Marie";


/*
 * LICENCE SETTINGS
 */

config.licences.externalLicenceNumber = {
  fieldLabel: "Municipal Licence Number",
  newCalculation: "range"
};


config.licences.externalReceiptNumber = {
  fieldLabel: "GP Receipt Number"
};

config.licences.feeCalculationFn = function(licenceObj) {

  const totalPrizeValue = (licenceObj.totalPrizeValue || 0.0);

  const licenceFeeMin = 10;

  const calculatedLicenceFee = totalPrizeValue * 0.03;

  let fee = Math.max(licenceFeeMin, calculatedLicenceFee);
  let message = (fee === licenceFeeMin ?
    "Base minimum licence fee." :
    "3% of $" + licenceObj.totalPrizeValue);
  let licenceHasErrors = false;

  // check the total prize value

  if (licenceObj.licenceTypeKey === "RA") {

    const licenceFields = licenceObj.licenceFields;

    // get the minimum ticket cost

    let ticketCost = parseFloat(licenceFields.ticketCost || "0");

    if (licenceFields.discount1_tickets !== "" && licenceFields.discount1_cost !== "") {

      const discountTicketCost = parseFloat(licenceFields.discount1_cost) / parseInt(licenceFields.discount1_tickets);
      ticketCost = Math.min(ticketCost, discountTicketCost);

    }

    if (licenceFields.discount2_tickets !== "" && licenceFields.discount2_cost !== "") {

      const discountTicketCost = parseFloat(licenceFields.discount2_cost) / parseInt(licenceFields.discount2_tickets);
      ticketCost = Math.min(ticketCost, discountTicketCost);

    }

    if (licenceFields.discount3_tickets !== "" && licenceFields.discount3_cost !== "") {

      const discountTicketCost =
        parseFloat(licenceFields.discount3_cost) / parseInt(licenceFields.discount3_tickets);
      ticketCost = Math.min(ticketCost, discountTicketCost);

    }

    // calculate the minimum prize value

    let minPotentialTakeIn =
      ticketCost * parseInt(licenceFields.ticketCount || "0");

    let minPrizeValue = minPotentialTakeIn * 0.2;

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

let licenceType_nevada = config.licenceTypes.find(function(licenceType) {

  return licenceType.licenceTypeKey === "NV";

});


/*
 * For each ticket type, set a fee of 3% of the prizesPerDeal
 */

for (let ticketTypeIndex = 0; ticketTypeIndex < licenceType_nevada.ticketTypes.length; ticketTypeIndex += 1) {

  licenceType_nevada.ticketTypes[ticketTypeIndex].feePerUnit =
    Math.round(licenceType_nevada.ticketTypes[ticketTypeIndex].prizesPerDeal * 0.03 * 100) / 100;

}


/*
 * Add additional inactive fields to Nevada licences
 * to handle older imported licences.
 */

licenceType_nevada.licenceFields = [{
  fieldKey: "distributor",
  fieldLabel: "Distributor",
  isActive: false,
  inputAttributes: {
    type: "text",
    maxlength: 100
  }
}, {
  fieldKey: "manufacturer",
  fieldLabel: "Manufacturer",
  isActive: false,
  inputAttributes: {
    type: "text",
    maxlength: 100
  }
}, {
  fieldKey: "units",
  fieldLabel: "Units",
  isActive: false,
  inputAttributes: {
    type: "number",
    min: 0,
    max: 1000000,
    step: 1
  }
}];


module.exports = config;
