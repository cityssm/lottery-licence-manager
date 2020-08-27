"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const licencesDB_voidTransaction = require("../../helpers/licencesDB/voidTransaction");
exports.handler = (req, res) => {
    const success = licencesDB_voidTransaction.voidTransaction(req.body.licenceID, req.body.transactionIndex, req.session);
    if (success) {
        res.json({
            success: true,
            message: "Transaction Voided Successfully"
        });
    }
    else {
        res.json({
            success: false,
            message: "Transaction Not Voided"
        });
    }
};
