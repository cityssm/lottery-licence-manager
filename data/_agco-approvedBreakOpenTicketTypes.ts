import { ticketTypes_BN } from "./_agco-approvedBreakOpenTicketTypes-BN";
import { ticketTypes_SP } from "./_agco-approvedBreakOpenTicketTypes-SP";
import { ticketTypes_AG } from "./_agco-approvedBreakOpenTicketTypes-AG";
import { ticketTypes_PG } from "./_agco-approvedBreakOpenTicketTypes-PG";


export const ticketTypes = ticketTypes_BN
  .concat(ticketTypes_SP)
  .concat(ticketTypes_AG)
  .concat(ticketTypes_PG);
