"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_addTransaction = require("../../helpers/licencesDB/addTransaction");
exports.handler = (req, res) => {
    const newTransactionIndex = licencesDB_addTransaction.addTransaction(req.body, req.session);
    res.json({
        success: true,
        message: "Transaction Added Successfully",
        transactionIndex: newTransactionIndex
    });
};
