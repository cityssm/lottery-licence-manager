import { runSQL } from "./_runSQL";

import type * as llm from "../../types/recordTypes";


export const updateOrganizationRepresentative =
  (organizationID: number, reqBody: llm.OrganizationRepresentative) => {

    runSQL("update OrganizationRepresentatives" +
      " set representativeName = ?," +
      " representativeTitle = ?," +
      " representativeAddress1 = ?," +
      " representativeAddress2 = ?," +
      " representativeCity = ?," +
      " representativeProvince = ?," +
      " representativePostalCode = ?," +
      " representativePhoneNumber = ?," +
      " representativePhoneNumber2 = ?," +
      " representativeEmailAddress = ?" +
      " where organizationID = ?" +
      " and representativeIndex = ?", [
        reqBody.representativeName, reqBody.representativeTitle,
        reqBody.representativeAddress1, reqBody.representativeAddress2,
        reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode,
        reqBody.representativePhoneNumber, reqBody.representativePhoneNumber2, reqBody.representativeEmailAddress,
        organizationID, reqBody.representativeIndex
      ]);

    const representativeObj: llm.OrganizationRepresentative = {
      organizationID,
      representativeIndex: reqBody.representativeIndex,
      representativeName: reqBody.representativeName,
      representativeTitle: reqBody.representativeTitle,
      representativeAddress1: reqBody.representativeAddress1,
      representativeAddress2: reqBody.representativeAddress2,
      representativeCity: reqBody.representativeCity,
      representativeProvince: reqBody.representativeProvince,
      representativePostalCode: reqBody.representativePostalCode,
      representativePhoneNumber: reqBody.representativePhoneNumber,
      representativePhoneNumber2: reqBody.representativePhoneNumber2,
      representativeEmailAddress: reqBody.representativeEmailAddress,
      isDefault: Number(reqBody.isDefault) > 0
    };

    return representativeObj;
  };
