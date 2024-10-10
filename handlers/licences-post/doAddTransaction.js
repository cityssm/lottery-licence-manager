import addTransaction from '../../helpers/licencesDB/addTransaction.js';
export default function handler(request, response) {
    const newTransactionIndex = addTransaction(request.body, request.session.user);
    response.json({
        success: true,
        message: 'Transaction Added Successfully',
        transactionIndex: newTransactionIndex
    });
}
