import addOrganizationBankRecord from '../../helpers/licencesDB/addOrganizationBankRecord.js';
import deleteOrganizationBankRecord from '../../helpers/licencesDB/deleteOrganizationBankRecord.js';
import updateOrganizationBankRecord from '../../helpers/licencesDB/updateOrganizationBankRecord.js';
function bankRecordIsBlank(_bankRecord) {
    return false;
}
export default function handler(request, response) {
    const organizationID = Number.parseInt(request.body.organizationID, 10);
    const accountNumber = request.body.accountNumber;
    const bankingYear = Number.parseInt(request.body.bankingYear, 10);
    const bankingMonth = Number.parseInt(request.body.bankingMonth, 10);
    const maxBankRecordTypeIndex = Number.parseInt(request.body.bankRecordTypeIndex, 10);
    let success = true;
    for (let typeIndex = 0; typeIndex <= maxBankRecordTypeIndex; typeIndex += 1) {
        const typeIndexString = typeIndex.toString();
        const recordIndex = request.body[`recordIndex-${typeIndexString}`] === ''
            ? undefined
            : Number.parseInt(request.body[`recordIndex-${typeIndexString}`], 10);
        const bankRecord = {
            recordType: 'bankRecord',
            organizationID,
            accountNumber,
            bankingYear,
            bankingMonth,
            recordIndex,
            bankRecordType: request.body[`bankRecordType-${typeIndexString}`],
            recordDateString: request.body[`recordDateString-${typeIndexString}`],
            recordNote: request.body[`recordNote-${typeIndexString}`],
            recordIsNA: request.body[`recordIsNA-${typeIndexString}`] === '1'
        };
        if (request.body['recordIndex-' + typeIndexString] === '') {
            if (!bankRecordIsBlank(bankRecord)) {
                const addSuccess = addOrganizationBankRecord(bankRecord, request.session.user);
                if (!addSuccess) {
                    success = false;
                }
            }
        }
        else if (bankRecordIsBlank(bankRecord)) {
            const deleteSuccess = deleteOrganizationBankRecord(organizationID, recordIndex, request.session);
            if (!deleteSuccess) {
                success = false;
            }
        }
        else {
            const updateSuccess = updateOrganizationBankRecord(bankRecord, request.session.user);
            if (!updateSuccess) {
                success = false;
            }
        }
    }
    if (success) {
        response.json({
            success: true
        });
    }
    else {
        response.json({
            success: false,
            message: 'Please try again.'
        });
    }
}
