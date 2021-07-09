import { ticketTypes_BN } from "./agco.approvedBreakOpenTicketTypes.bn.js";
import { ticketTypes_SP } from "./agco.approvedBreakOpenTicketTypes.sp.js";
import { ticketTypes_AG } from "./agco.approvedBreakOpenTicketTypes.ag.js";
import { ticketTypes_PG } from "./agco.approvedBreakOpenTicketTypes.pg.js";
export const ticketTypes = [
    ...ticketTypes_BN,
    ...ticketTypes_SP,
    ...ticketTypes_AG,
    ...ticketTypes_PG
];
