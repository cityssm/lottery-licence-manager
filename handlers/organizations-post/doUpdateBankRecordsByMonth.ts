import type { RequestHandler } from "express";

import { addOrganizationBankRecord } from "../../helpers/licencesDB/addOrganizationBankRecord.js";
import { updateOrganizationBankRecord } from "../../helpers/licencesDB/updateOrganizationBankRecord.js";
import { deleteOrganizationBankRecord } from "../../helpers/licencesDB/deleteOrganizationBankRecord.js";

import type * as llm from "../../types/recordTypes";


const bankRecordIsBlank = (_bankRecord: llm.OrganizationBankRecord) => {
  /*
  if (bankRecord.recordDateString === "" && bankRecord.recordNote === "" && !bankRecord.recordIsNA) {
    return true;
  }
  */

  return false;
};


export const handler: RequestHandler = (request, response) => {

  const organizationID = Number.parseInt(request.body.organizationID, 10);
  const accountNumber = request.body.accountNumber;
  const bankingYear = Number.parseInt(request.body.bankingYear, 10);
  const bankingMonth = Number.parseInt(request.body.bankingMonth, 10);

  const maxBankRecordTypeIndex = Number.parseInt(request.body.bankRecordTypeIndex, 10);

  let success = true;

  for (let typeIndex = 0; typeIndex <= maxBankRecordTypeIndex; typeIndex += 1) {

    const typeIndexString = typeIndex.toString();

    const recordIndex = (request.body["recordIndex-" + typeIndexString] === ""
      ? undefined
      : Number.parseInt(request.body["recordIndex-" + typeIndexString], 10));

    const bankRecord: llm.OrganizationBankRecord = {
      recordType: "bankRecord",
      organizationID,
      accountNumber,
      bankingYear,
      bankingMonth,
      recordIndex,
      bankRecordType: request.body["bankRecordType-" + typeIndexString],
      recordDateString: request.body["recordDateString-" + typeIndexString],
      recordNote: request.body["recordNote-" + typeIndexString],
      recordIsNA: (request.body["recordIsNA-" + typeIndexString] === "1")
    };

    if (request.body["recordIndex-" + typeIndexString] === "") {

      if (!bankRecordIsBlank(bankRecord)) {
        const addSuccess = addOrganizationBankRecord(bankRecord, request.session);
        if (!addSuccess) {
          success = false;
        }
      }

    } else {

      if (bankRecordIsBlank(bankRecord)) {
        const deleteSuccess = deleteOrganizationBankRecord(organizationID, recordIndex, request.session);
        if (!deleteSuccess) {
          success = false;
        }
      } else {
        const updateSuccess = updateOrganizationBankRecord(bankRecord, request.session);
        if (!updateSuccess) {
          success = false;
        }
      }
    }
  }

  return success
    ? response.json({
      success: true
    })
    : response.json({
      success: false,
      message: "Please try again."
    });
};


export default handler;
