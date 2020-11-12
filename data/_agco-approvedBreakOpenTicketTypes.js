"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketTypes = void 0;
const _agco_approvedBreakOpenTicketTypes_BN_1 = require("./_agco-approvedBreakOpenTicketTypes-BN");
const _agco_approvedBreakOpenTicketTypes_SP_1 = require("./_agco-approvedBreakOpenTicketTypes-SP");
const _agco_approvedBreakOpenTicketTypes_AG_1 = require("./_agco-approvedBreakOpenTicketTypes-AG");
const _agco_approvedBreakOpenTicketTypes_PG_1 = require("./_agco-approvedBreakOpenTicketTypes-PG");
exports.ticketTypes = _agco_approvedBreakOpenTicketTypes_BN_1.ticketTypes_BN
    .concat(_agco_approvedBreakOpenTicketTypes_SP_1.ticketTypes_SP)
    .concat(_agco_approvedBreakOpenTicketTypes_AG_1.ticketTypes_AG)
    .concat(_agco_approvedBreakOpenTicketTypes_PG_1.ticketTypes_PG);
