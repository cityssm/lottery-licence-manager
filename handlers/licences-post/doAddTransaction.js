import { addTransaction } from "../../helpers/licencesDB/addTransaction.js";
export const handler = (req, res) => {
    const newTransactionIndex = addTransaction(req.body, req.session);
    res.json({
        success: true,
        message: "Transaction Added Successfully",
        transactionIndex: newTransactionIndex
    });
};
export default handler;
