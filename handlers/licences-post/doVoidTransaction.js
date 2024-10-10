import voidTransaction from '../../helpers/licencesDB/voidTransaction.js';
export default function handler(request, response) {
    const success = voidTransaction(request.body.licenceID, request.body.transactionIndex, request.session);
    if (success) {
        response.json({
            success: true,
            message: 'Transaction Voided Successfully'
        });
    }
    else {
        response.json({
            success: false,
            message: 'Transaction Not Voided'
        });
    }
}
