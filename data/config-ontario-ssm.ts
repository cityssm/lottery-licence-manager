import type * as recordTypes from "../types/recordTypes";
import type * as configTypes from "../types/configTypes";

import * as objectFns from "../helpers/objectFns.js";

import { config as configOntario } from "./config-ontario.js";


export const config: configTypes.Config = Object.assign({}, configOntario);


/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: "SSM Lottery Licence Manager"
};


config.session = {
  doKeepAlive: true
};


/*
 * DEFAULT VALUES
 */

config.defaults.city = "Sault Ste. Marie";

config.reminders = {
  preferredSortOrder: "config",
  dismissingStatuses: ["Received", "Not Applicable", "Dismissed"]
};

/*
 * LICENCE SETTINGS
 */

config.licences.externalLicenceNumber.newCalculation = "range";


config.licences.externalReceiptNumber = {
  fieldLabel: "GP Receipt Number"
};

config.licences.feeCalculationFn = (licenceObj: recordTypes.LotteryLicence) => {

  const totalPrizeValue = (licenceObj.totalPrizeValue || 0.0);

  const licenceFeeMin = 10;

  const calculatedLicenceFee = totalPrizeValue * 0.03;

  let fee = Math.max(licenceFeeMin, calculatedLicenceFee);
  let message = (fee === licenceFeeMin
    ? "Base minimum licence fee."
    : "3% of $" + licenceObj.totalPrizeValue.toFixed(2));
  let licenceHasErrors = false;

  // Check the total prize value

  if (licenceObj.licenceTypeKey === "BI") {

    fee = totalPrizeValue * 0.03 * licenceObj.events.length;

    message = "3% of $" + licenceObj.totalPrizeValue.toFixed(2) +
      " times " + licenceObj.events.length.toString() + " events";

  } else if (licenceObj.licenceTypeKey === "RA") {

    const licenceFieldData = objectFns.fieldDataArrayToObject(licenceObj.licenceFields);

    // Get the minimum ticket cost

    let ticketCost = parseFloat(licenceFieldData.ticketCost || "0");

    if (licenceFieldData.discount1_tickets !== "" && licenceFieldData.discount1_cost !== "") {

      const discountTicketCost =
        parseFloat(licenceFieldData.discount1_cost) / parseInt(licenceFieldData.discount1_tickets, 10);

      ticketCost = Math.min(ticketCost, discountTicketCost);

    }

    if (licenceFieldData.discount2_tickets !== "" && licenceFieldData.discount2_cost !== "") {

      const discountTicketCost =
        parseFloat(licenceFieldData.discount2_cost) / parseInt(licenceFieldData.discount2_tickets, 10);

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
      message = "Total Prize Value must be a minimum of $" + minPrizeValue.toFixed(2) + ".";

    }

  }

  return {
    fee: fee.toFixed(2),
    message,
    licenceHasErrors
  };

};


/*
 * SAULT STE MARIE SPECIFICS FOR NEVADA LICENSING
 */

const licenceTypeNevada = config.licenceTypes.find((licenceType) => licenceType.licenceTypeKey === "NV");


/*
 * For each ticket type, set a fee of 3% of the prizesPerDeal
 */

for (const nevadaTicketType of licenceTypeNevada.ticketTypes) {
  nevadaTicketType.feePerUnit = Math.round(nevadaTicketType.prizesPerDeal * 0.03 * 100) / 100;
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
