import { runSQL } from "./_runSQL.js";

import type * as llm from "../../types/recordTypes";


export const updateOrganizationRepresentative =
  (organizationID: number, requestBody: llm.OrganizationRepresentative): llm.OrganizationRepresentative => {

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
        requestBody.representativeName, requestBody.representativeTitle,
        requestBody.representativeAddress1, requestBody.representativeAddress2,
        requestBody.representativeCity, requestBody.representativeProvince, requestBody.representativePostalCode,
        requestBody.representativePhoneNumber, requestBody.representativePhoneNumber2, requestBody.representativeEmailAddress,
        organizationID, requestBody.representativeIndex
      ]);

    const representativeObject: llm.OrganizationRepresentative = {
      organizationID,
      representativeIndex: requestBody.representativeIndex,
      representativeName: requestBody.representativeName,
      representativeTitle: requestBody.representativeTitle,
      representativeAddress1: requestBody.representativeAddress1,
      representativeAddress2: requestBody.representativeAddress2,
      representativeCity: requestBody.representativeCity,
      representativeProvince: requestBody.representativeProvince,
      representativePostalCode: requestBody.representativePostalCode,
      representativePhoneNumber: requestBody.representativePhoneNumber,
      representativePhoneNumber2: requestBody.representativePhoneNumber2,
      representativeEmailAddress: requestBody.representativeEmailAddress,
      isDefault: Number(requestBody.isDefault) > 0
    };

    return representativeObject;
  };
