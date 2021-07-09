import { ConfigTicketType } from "../types/configTypes.js";


/*
 * Source
 * https://www.agco.ca/sites/default/files/schedule_of_approved_bot_types_and_associated_expense_maximumsen.pdf
 */


export const ticketTypes_PG: ConfigTicketType[] = [

  {
    ticketType: "PG1",
    ticketPrice: 1,
    ticketCount: 440,
    prizesPerDeal: 286
  },
  {
    ticketType: "PG2",
    ticketPrice: 1,
    ticketCount: 600,
    prizesPerDeal: 392
  },
  {
    ticketType: "PG3",
    ticketPrice: 0.5,
    ticketCount: 3360,
    prizesPerDeal: 1115
  },
  {
    ticketType: "PG4",
    ticketPrice: 1,
    ticketCount: 320,
    prizesPerDeal: 208
  }
];

export default ticketTypes_PG;
