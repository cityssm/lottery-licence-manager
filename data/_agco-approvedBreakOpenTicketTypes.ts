import { ticketTypes_BN } from "./_agco-approvedBreakOpenTicketTypes-BN.js";
import { ticketTypes_SP } from "./_agco-approvedBreakOpenTicketTypes-SP.js";
import { ticketTypes_AG } from "./_agco-approvedBreakOpenTicketTypes-AG.js";
import { ticketTypes_PG } from "./_agco-approvedBreakOpenTicketTypes-PG.js";


export const ticketTypes = ticketTypes_BN
  .concat(ticketTypes_SP)
  .concat(ticketTypes_AG)
  .concat(ticketTypes_PG);
