import { voidTransaction } from "../../helpers/licencesDB/voidTransaction.js";
export const handler = (req, res) => {
    const success = voidTransaction(req.body.licenceID, req.body.transactionIndex, req.session);
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
