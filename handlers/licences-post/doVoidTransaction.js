"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const voidTransaction_1 = require("../../helpers/licencesDB/voidTransaction");
const handler = (req, res) => {
    const success = voidTransaction_1.voidTransaction(req.body.licenceID, req.body.transactionIndex, req.session);
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
exports.handler = handler;
