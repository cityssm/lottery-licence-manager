import getPastEventBankingInformation from '../../helpers/licencesDB/getPastEventBankingInformation.js';
export default function handler(request, response) {
    const bankInfoList = getPastEventBankingInformation(request.body.licenceID);
    response.json(bankInfoList);
}
