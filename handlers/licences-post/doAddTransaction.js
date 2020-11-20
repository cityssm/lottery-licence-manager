"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const addTransaction_1 = require("../../helpers/licencesDB/addTransaction");
const handler = (req, res) => {
    const newTransactionIndex = addTransaction_1.addTransaction(req.body, req.session);
    res.json({
        success: true,
        message: "Transaction Added Successfully",
        transactionIndex: newTransactionIndex
    });
};
exports.handler = handler;
