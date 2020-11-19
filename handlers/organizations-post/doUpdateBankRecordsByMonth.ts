import type { RequestHandler } from "express";

import { addOrganizationBankRecord } from "../../helpers/licencesDB/addOrganizationBankRecord";
import { updateOrganizationBankRecord } from "../../helpers/licencesDB/updateOrganizationBankRecord";
import { deleteOrganizationBankRecord } from "../../helpers/licencesDB/deleteOrganizationBankRecord";

import type * as llm from "../../types/recordTypes";


const bankRecordIsBlank = (bankRecord: llm.OrganizationBankRecord) => {

  if (bankRecord.recordDateString === "" && bankRecord.recordNote === "" && !bankRecord.recordIsNA) {
    return true;
  }
  return false;
};


export const handler: RequestHandler = (req, res) => {

  const organizationID = parseInt(req.body.organizationID, 10);
  const accountNumber = req.body.accountNumber;
  const bankingYear = parseInt(req.body.bankingYear, 10);
  const bankingMonth = parseInt(req.body.bankingMonth, 10);

  const maxBankRecordTypeIndex = parseInt(req.body.bankRecordTypeIndex, 10);

  let success = true;

  for (let typeIndex = 0; typeIndex <= maxBankRecordTypeIndex; typeIndex += 1) {

    const typeIndexString = typeIndex.toString();

    const recordIndex = (req.body["recordIndex-" + typeIndexString] === "" ? null : parseInt(req.body["recordIndex-" + typeIndexString], 10));

    const bankRecord: llm.OrganizationBankRecord = {
      recordType: "bankRecord",
      organizationID,
      accountNumber,
      bankingYear,
      bankingMonth,
      recordIndex,
      bankRecordType: req.body["bankRecordType-" + typeIndexString],
      recordDateString: req.body["recordDateString-" + typeIndexString],
      recordNote: req.body["recordNote-" + typeIndexString],
      recordIsNA: (req.body["recordIsNA-" + typeIndexString] === "1")
    };

    if (req.body["recordIndex-" + typeIndexString] === "") {

      if (!bankRecordIsBlank(bankRecord)) {
        const addSuccess = addOrganizationBankRecord(bankRecord, req.session);
        if (!addSuccess) {
          success = false;
        }
      }

    } else {

      if (bankRecordIsBlank(bankRecord)) {
        const deleteSuccess = deleteOrganizationBankRecord(organizationID, recordIndex, req.session);
        if (!deleteSuccess) {
          success = false;
        }
      } else {
        const updateSuccess = updateOrganizationBankRecord(bankRecord, req.session);
        if (!updateSuccess) {
          success = false;
        }
      }
    }
  }

  if (success) {
    return res.json({
      success: true
    });

  } else {
    return res.json({
      success: false,
      message: "Please try again."
    });
  }

};
