/* global module */

const config = {};

/*
 * APPLICATION SETTINGS
 */

config.application = {
  applicationName: "Lottery Licence Manager",
  logoURL: "/images/bingoBalls.png",
  httpPort: 3000
};


/*
config.application.https = {
  port: 3030,
  keyPath: "./ssl/key.pem",
  certPath: "./ssl/cert.pem",
  passphrase: "lottery-licence-manager"
};
*/


config.admin = {
  defaultPassword: ""
};


/*
 * USER SETTINGS
 */

config.user = {
  createUpdateWindowMillis: 60 * 60 * 1000,

  defaultProperties: {
    canCreate: "false",
    canUpdate: "false",
    isAdmin: "false"
  }
};


config.defaults = {
  city: "",
  province: "ON"
};



config.licences = {
  feeCalculationFn: function(licenceObj) {
    "use strict";

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
        const discountTicketCost = parseFloat(licenceFields.discount3_cost) / parseInt(licenceFields.discount3_tickets);
        ticketCost = Math.min(ticketCost, discountTicketCost);
      }

      // calculate the minimum prize value

      let minPotentialTakeIn = ticketCost * parseInt(licenceFields.ticketCount || "0");

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
  }
};


config.licenceTypes = [{
  licenceTypeKey: "BA",
  licenceType: "Bazaar",
  isActive: true,
  licenceFields: [{
    fieldKey: "wheelCount",
    fieldLabel: "Number of Wheels",
    isActive: true,
    inputAttributes: {
      type: "number",
      min: 0,
      max: 100,
      step: 1
    }
  }],
  eventFields: [{
    fieldKey: "wheelCount",
    fieldLabel: "Number of Wheels",
    isActive: true,
    inputAttributes: {
      type: "number",
      min: 0,
      max: 100,
      step: 1
    }
  }]
}, {
  licenceTypeKey: "BI",
  licenceType: "Bingo",
  isActive: true,
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
  }]
}, {
  licenceTypeKey: "NV",
  licenceType: "Nevada",
  isActive: true,
  ticketTypes: [{
    ticketType: "BN1",
    ticketPrice: 0.5,
    ticketCount: 3360,
    prizesPerDeal: 1115
  }, {
    ticketType: "BN14",
    ticketPrice: 1,
    ticketCount: 7420,
    prizesPerDeal: 4930
  }, {
    ticketType: "BN26",
    ticketPrice: 1,
    ticketCount: 16800,
    prizesPerDeal: 11440
  }],
  licenceFields: [{
    fieldKey: "distributor",
    fieldLabel: "Distributor",
    isActive: true,
    inputAttributes: {
      type: "text",
      maxlength: 100
    }
  }, {
    fieldKey: "manufacturer",
    fieldLabel: "Manufacturer",
    isActive: true,
    includeDatalist: true,
    inputAttributes: {
      type: "text",
      maxlength: 100
    }
  }, {
    fieldKey: "units",
    fieldLabel: "Units",
    isActive: true,
    inputAttributes: {
      type: "number",
      min: 0,
      max: 1000000,
      step: 1
    }
  }],
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
  }]
}, {
  licenceTypeKey: "RA",
  licenceType: "Raffle",
  isActive: true,
  licenceFields: [{
    fieldKey: "drawCount",
    fieldLabel: "Number of Draws",
    isActive: true,
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
    inputAttributes: {
      type: "number",
      min: 0.00,
      max: 2000.00,
      step: 0.01
    }
  }],
  eventFields: [{
    fieldKey: "ticketsPrintedCount",
    fieldLabel: "Tickets Printed",
    isActive: true,
    inputAttributes: {
      type: "number",
      min: 0,
      max: 1000000,
      step: 1
    }
  }, {
    fieldKey: "ticketsSoldCount",
    fieldLabel: "Tickets Sold",
    isActive: true,
    inputAttributes: {
      type: "number",
      min: 0,
      max: 1000000,
      step: 1
    }
  }, {
    fieldKey: "ticketCost",
    fieldLabel: "Cost per Ticket",
    isActive: true,
    inputAttributes: {
      type: "number",
      min: 0.00,
      max: 1000.00,
      step: 0.01
    }
  }]
}];


module.exports = config;
