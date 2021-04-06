"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const getPastEventBankingInformation_1 = require("../../helpers/licencesDB/getPastEventBankingInformation");
const handler = (req, res) => {
    const bankInfoList = getPastEventBankingInformation_1.getPastEventBankingInformation(req.body.licenceID);
    res.json(bankInfoList);
};
exports.handler = handler;
