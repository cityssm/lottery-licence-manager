/* global module */

/*
 * Source
 * https://www.agco.ca/sites/default/files/schedule_of_approved_bot_types_and_associated_expense_maximumsen.pdf
 */

const ticketTypes_AG = [{
  ticketType: "AG11",
  ticketPrice: 0.5,
  ticketCount: 8400,
  prizesPerDeal: 2860
}];

const ticketTypes_BN = [{
  ticketType: "BN1",
  ticketPrice: 0.5,
  ticketCount: 3360,
  prizesPerDeal: 1115
}, {
  ticketType: "BN3",
  ticketPrice: 0.5,
  ticketCount: 2380,
  prizesPerDeal: 744
}, {
  ticketType: "BN14",
  ticketPrice: 1,
  ticketCount: 7420,
  prizesPerDeal: 4930
}, {
  ticketType: "BN21",
  ticketPrice: 0.5,
  ticketCount: 2730,
  prizesPerDeal: 930
}, {
  ticketType: "BN22",
  ticketPrice: 0.5,
  ticketCount: 4200,
  prizesPerDeal: 1430
}, {
  ticketType: "BN26",
  ticketPrice: 1,
  ticketCount: 16800,
  prizesPerDeal: 11440
}, {
  ticketType: "BN55",
  ticketPrice: 1,
  ticketCount: 210,
  prizesPerDeal: 137
}];

const ticketTypes_SP = [{
  ticketType: "SP1",
  ticketPrice: 0.5,
  ticketCount: 2730,
  prizesPerDeal: 930
}, {
  ticketType: "SP21",
  ticketPrice: 0.5,
  ticketCount: 3360,
  prizesPerDeal: 1115
}];


const ticketTypes = ticketTypes_BN
  .concat(ticketTypes_SP)
  .concat(ticketTypes_AG);

module.exports = ticketTypes;
