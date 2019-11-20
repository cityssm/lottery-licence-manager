/* global module */


const config = {};


config.application = {};

config.application.applicationName = "Lottery Licence Manager";
config.application.logoURL = "images/bingoBalls.png";

config.application.port = 3000;


config.defaults = {};

config.defaults.city = "Sault Ste. Marie";
config.defaults.province = "ON";


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
  }]
}, {
  licenceTypeKey: "BI",
  licenceType: "Bingo",
  isActive: true
}, {
  licenceTypeKey: "NV",
  licenceType: "Nevada",
  isActive: true,
  includeDatalist: true,
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
  }]
}];

module.exports = config;
