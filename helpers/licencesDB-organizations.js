"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationBankRecord = exports.updateOrganizationBankRecord = exports.addOrganizationBankRecord = exports.getOrganizationBankRecordStats = exports.getOrganizationBankRecords = exports.deleteOrganizationRemark = exports.updateOrganizationRemark = exports.addOrganizationRemark = exports.getOrganizationRemark = exports.getOrganizationRemarks = exports.setDefaultOrganizationRepresentative = exports.deleteOrganizationRepresentative = exports.updateOrganizationRepresentative = exports.addOrganizationRepresentative = exports.getDeletedOrganizations = exports.getInactiveOrganizations = exports.restoreOrganization = exports.deleteOrganization = exports.updateOrganization = exports.createOrganization = exports.getOrganization = exports.getOrganizations = void 0;
const licencesDB_1 = require("./licencesDB");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const dateTimeFns = __importStar(require("@cityssm/expressjs-server-js/dateTimeFns"));
function getOrganizations(reqBody, reqSession, includeOptions) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordType = "organization";
        ele.licences_endDateMaxString = dateTimeFns.dateIntegerToString(ele.licences_endDateMax || 0);
        ele.canUpdate = licencesDB_1.canUpdateObject(ele, reqSession);
        delete ele.recordCreate_userName;
        delete ele.recordCreate_timeMillis;
        delete ele.recordUpdate_userName;
        delete ele.recordUpdate_timeMillis;
    };
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const sqlParams = [dateTimeFns.dateToInteger(new Date())];
    let sql = "select o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
        " r.representativeName," +
        " sum(case when l.endDate >= ? then 1 else 0 end) as licences_activeCount," +
        " max(l.endDate) as licences_endDateMax," +
        " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " from Organizations o" +
        " left join OrganizationRepresentatives r on o.organizationID = r.organizationID and r.isDefault = 1" +
        " left join LotteryLicences l on o.organizationID = l.organizationID and l.recordDelete_timeMillis is null" +
        " where o.recordDelete_timeMillis is null";
    if (reqBody.organizationName && reqBody.organizationName !== "") {
        const organizationNamePieces = reqBody.organizationName.toLowerCase().split(" ");
        for (let pieceIndex = 0; pieceIndex < organizationNamePieces.length; pieceIndex += 1) {
            sql += " and instr(lower(o.organizationName), ?)";
            sqlParams.push(organizationNamePieces[pieceIndex]);
        }
    }
    if (reqBody.representativeName && reqBody.representativeName !== "") {
        const representativeNamePieces = reqBody.representativeName.toLowerCase().split(" ");
        for (let pieceIndex = 0; pieceIndex < representativeNamePieces.length; pieceIndex += 1) {
            sql += " and o.organizationID in (" +
                "select organizationID from OrganizationRepresentatives where instr(lower(representativeName), ?)" +
                ")";
            sqlParams.push(representativeNamePieces[pieceIndex]);
        }
    }
    if (reqBody.isEligibleForLicences && reqBody.isEligibleForLicences !== "") {
        sql += " and o.isEligibleForLicences = ?";
        sqlParams.push(reqBody.isEligibleForLicences);
    }
    sql += " group by o.organizationID, o.organizationName, o.isEligibleForLicences, o.organizationNote," +
        " r.representativeName," +
        " o.recordCreate_userName, o.recordCreate_timeMillis, o.recordUpdate_userName, o.recordUpdate_timeMillis" +
        " order by o.organizationName, o.organizationID";
    if (includeOptions.limit !== -1) {
        sql += " limit " + includeOptions.limit + " offset " + includeOptions.offset;
    }
    const rows = db.prepare(sql).all(sqlParams);
    db.close();
    rows.forEach(addCalculatedFieldsFn);
    return rows;
}
exports.getOrganizations = getOrganizations;
function getOrganization(organizationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const organizationObj = db.prepare("select * from Organizations" +
        " where organizationID = ?")
        .get(organizationID);
    if (organizationObj) {
        organizationObj.recordType = "organization";
        organizationObj.fiscalStartDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalStartDate);
        organizationObj.fiscalEndDateString = dateTimeFns.dateIntegerToString(organizationObj.fiscalEndDate);
        organizationObj.canUpdate = licencesDB_1.canUpdateObject(organizationObj, reqSession);
        const representativesList = db.prepare("select * from OrganizationRepresentatives" +
            " where organizationID = ?" +
            " order by isDefault desc, representativeName")
            .all(organizationID);
        organizationObj.organizationRepresentatives = representativesList;
    }
    db.close();
    return organizationObj;
}
exports.getOrganization = getOrganization;
function createOrganization(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("insert into Organizations (" +
        "organizationName, organizationAddress1, organizationAddress2," +
        " organizationCity, organizationProvince, organizationPostalCode," +
        " organizationNote," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationName, reqBody.organizationAddress1, reqBody.organizationAddress2, reqBody.organizationCity, reqBody.organizationProvince, reqBody.organizationPostalCode, "", reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return Number(info.lastInsertRowid);
}
exports.createOrganization = createOrganization;
function updateOrganization(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set organizationName = ?," +
        " organizationAddress1 = ?," +
        " organizationAddress2 = ?," +
        " organizationCity = ?," +
        " organizationProvince = ?," +
        " organizationPostalCode = ?," +
        " trustAccountNumber = ?," +
        " fiscalStartDate = ?," +
        " fiscalEndDate = ?," +
        " isEligibleForLicences = ?," +
        " organizationNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqBody.organizationName, reqBody.organizationAddress1, reqBody.organizationAddress2, reqBody.organizationCity, reqBody.organizationProvince, reqBody.organizationPostalCode, reqBody.trustAccountNumber, dateTimeFns.dateStringToInteger(reqBody.fiscalStartDateString), dateTimeFns.dateStringToInteger(reqBody.fiscalEndDateString), reqBody.isEligibleForLicences, reqBody.organizationNote, reqSession.user.userName, nowMillis, reqBody.organizationID);
    db.close();
    return info.changes > 0;
}
exports.updateOrganization = updateOrganization;
function deleteOrganization(organizationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID);
    db.close();
    return info.changes > 0;
}
exports.deleteOrganization = deleteOrganization;
function restoreOrganization(organizationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update Organizations" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordDelete_timeMillis is not null")
        .run(reqSession.user.userName, nowMillis, organizationID);
    db.close();
    return info.changes > 0;
}
exports.restoreOrganization = restoreOrganization;
function getInactiveOrganizations(inactiveYears) {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);
    const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select o.organizationID, o.organizationName," +
        " o.recordCreate_timeMillis, o.recordCreate_userName," +
        " o.recordUpdate_timeMillis, o.recordUpdate_userName," +
        " l.licences_endDateMax" +
        " from Organizations o" +
        " left join (" +
        ("select l.organizationID, max(l.endDate) as licences_endDateMax from LotteryLicences l" +
            " where l.recordDelete_timeMillis is null" +
            " group by l.organizationID" +
            ") l on o.organizationID = l.organizationID") +
        " where o.recordDelete_timeMillis is null" +
        " and (l.licences_endDateMax is null or l.licences_endDateMax <= ?)" +
        " order by o.organizationName, o.organizationID")
        .all(cutoffDateInteger);
    db.close();
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const organization = rows[rowIndex];
        organization.recordCreate_dateString = dateTimeFns.dateToString(new Date(organization.recordCreate_timeMillis));
        organization.recordUpdate_dateString = dateTimeFns.dateToString(new Date(organization.recordUpdate_timeMillis));
        organization.licences_endDateMaxString = dateTimeFns.dateIntegerToString(organization.licences_endDateMax || 0);
    }
    return rows;
}
exports.getInactiveOrganizations = getInactiveOrganizations;
function getDeletedOrganizations() {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordDelete_dateString = dateTimeFns.dateToString(new Date(ele.recordDelete_timeMillis));
    };
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const organizations = db.prepare("select organizationID, organizationName, recordDelete_timeMillis, recordDelete_userName" +
        " from Organizations" +
        " where recordDelete_timeMillis is not null" +
        " order by organizationName, recordDelete_timeMillis desc")
        .all();
    db.close();
    organizations.forEach(addCalculatedFieldsFn);
    return organizations;
}
exports.getDeletedOrganizations = getDeletedOrganizations;
function addOrganizationRepresentative(organizationID, reqBody) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const row = db.prepare("select count(representativeIndex) as indexCount," +
        " ifnull(max(representativeIndex), -1) as maxIndex" +
        " from OrganizationRepresentatives" +
        " where organizationID = ?")
        .get(organizationID);
    const newRepresentativeIndex = row.maxIndex + 1;
    const newIsDefault = (row.indexCount === 0 ? 1 : 0);
    db.prepare("insert into OrganizationRepresentatives (" +
        "organizationID, representativeIndex," +
        " representativeName, representativeTitle," +
        " representativeAddress1, representativeAddress2," +
        " representativeCity, representativeProvince, representativePostalCode," +
        " representativePhoneNumber, representativeEmailAddress," +
        " isDefault)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(organizationID, newRepresentativeIndex, reqBody.representativeName, reqBody.representativeTitle, reqBody.representativeAddress1, reqBody.representativeAddress2, reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode, reqBody.representativePhoneNumber, reqBody.representativeEmailAddress, newIsDefault);
    db.close();
    return {
        organizationID: organizationID,
        representativeIndex: newRepresentativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: newIsDefault === 1
    };
}
exports.addOrganizationRepresentative = addOrganizationRepresentative;
function updateOrganizationRepresentative(organizationID, reqBody) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    db.prepare("update OrganizationRepresentatives" +
        " set representativeName = ?," +
        " representativeTitle = ?," +
        " representativeAddress1 = ?," +
        " representativeAddress2 = ?," +
        " representativeCity = ?," +
        " representativeProvince = ?," +
        " representativePostalCode = ?," +
        " representativePhoneNumber = ?," +
        " representativeEmailAddress = ?" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(reqBody.representativeName, reqBody.representativeTitle, reqBody.representativeAddress1, reqBody.representativeAddress2, reqBody.representativeCity, reqBody.representativeProvince, reqBody.representativePostalCode, reqBody.representativePhoneNumber, reqBody.representativeEmailAddress, organizationID, reqBody.representativeIndex);
    db.close();
    return {
        organizationID: organizationID,
        representativeIndex: reqBody.representativeIndex,
        representativeName: reqBody.representativeName,
        representativeTitle: reqBody.representativeTitle,
        representativeAddress1: reqBody.representativeAddress1,
        representativeAddress2: reqBody.representativeAddress2,
        representativeCity: reqBody.representativeCity,
        representativeProvince: reqBody.representativeProvince,
        representativePostalCode: reqBody.representativePostalCode,
        representativePhoneNumber: reqBody.representativePhoneNumber,
        representativeEmailAddress: reqBody.representativeEmailAddress,
        isDefault: Number(reqBody.isDefault) > 0
    };
}
exports.updateOrganizationRepresentative = updateOrganizationRepresentative;
function deleteOrganizationRepresentative(organizationID, representativeIndex) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const info = db.prepare("delete from OrganizationRepresentatives" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(organizationID, representativeIndex);
    db.close();
    return info.changes > 0;
}
exports.deleteOrganizationRepresentative = deleteOrganizationRepresentative;
function setDefaultOrganizationRepresentative(organizationID, representativeIndex) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    db.prepare("update OrganizationRepresentatives" +
        " set isDefault = 0" +
        " where organizationID = ?")
        .run(organizationID);
    db.prepare("update OrganizationRepresentatives" +
        " set isDefault = 1" +
        " where organizationID = ?" +
        " and representativeIndex = ?")
        .run(organizationID, representativeIndex);
    db.close();
    return true;
}
exports.setDefaultOrganizationRepresentative = setDefaultOrganizationRepresentative;
function getOrganizationRemarks(organizationID, reqSession) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordType = "remark";
        ele.remarkDateString = dateTimeFns.dateIntegerToString(ele.remarkDate || 0);
        ele.remarkTimeString = dateTimeFns.timeIntegerToString(ele.remarkTime || 0);
        ele.canUpdate = licencesDB_1.canUpdateObject(ele, reqSession);
    };
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select remarkIndex," +
        " remarkDate, remarkTime," +
        " remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationRemarks" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " order by remarkDate desc, remarkTime desc")
        .all(organizationID);
    db.close();
    rows.forEach(addCalculatedFieldsFn);
    return rows;
}
exports.getOrganizationRemarks = getOrganizationRemarks;
function getOrganizationRemark(organizationID, remarkIndex, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const remark = db.prepare("select" +
        " remarkDate, remarkTime," +
        " remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationRemarks" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and remarkIndex = ?")
        .get(organizationID, remarkIndex);
    db.close();
    remark.recordType = "remark";
    remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate || 0);
    remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime || 0);
    remark.canUpdate = licencesDB_1.canUpdateObject(remark, reqSession);
    return remark;
}
exports.getOrganizationRemark = getOrganizationRemark;
function addOrganizationRemark(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const row = db.prepare("select ifnull(max(remarkIndex), -1) as maxIndex" +
        " from OrganizationRemarks" +
        " where organizationID = ?")
        .get(reqBody.organizationID);
    const newRemarkIndex = row.maxIndex + 1;
    const rightNow = new Date();
    const remarkDate = dateTimeFns.dateToInteger(rightNow);
    const remarkTime = dateTimeFns.dateToTimeInteger(rightNow);
    db.prepare("insert into OrganizationRemarks (" +
        "organizationID, remarkIndex," +
        " remarkDate, remarkTime, remark, isImportant," +
        " recordCreate_userName, recordCreate_timeMillis," +
        " recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newRemarkIndex, remarkDate, remarkTime, reqBody.remark, 0, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    return Number(newRemarkIndex);
}
exports.addOrganizationRemark = addOrganizationRemark;
function updateOrganizationRemark(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " isImportant = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.remarkDateString), dateTimeFns.timeStringToInteger(reqBody.remarkTimeString), reqBody.remark, reqBody.isImportant ? 1 : 0, reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.remarkIndex);
    db.close();
    return info.changes > 0;
}
exports.updateOrganizationRemark = updateOrganizationRemark;
function deleteOrganizationRemark(organizationID, remarkIndex, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationRemarks" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID, remarkIndex);
    db.close();
    return info.changes > 0;
}
exports.deleteOrganizationRemark = deleteOrganizationRemark;
function getOrganizationBankRecords(organizationID, accountNumber, bankingYear) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordDateString = dateTimeFns.dateIntegerToString(ele.recordDate);
    };
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select recordIndex," +
        " bankingMonth, bankRecordType," +
        " recordDate, recordNote, recordIsNA," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from OrganizationBankRecords" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " and accountNumber = ?" +
        " and bankingYear = ?")
        .all(organizationID, accountNumber, bankingYear);
    db.close();
    rows.forEach(addCalculatedFieldsFn);
    return rows;
}
exports.getOrganizationBankRecords = getOrganizationBankRecords;
function getOrganizationBankRecordStats(organizationID) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select accountNumber," +
        " min(bankingYear) as bankingYearMin," +
        " max(bankingYear) as bankingYearMax" +
        " from OrganizationBankRecords" +
        " where recordDelete_timeMillis is null" +
        " and organizationID = ?" +
        " group by accountNumber" +
        " order by bankingYearMax desc, accountNumber")
        .all(organizationID);
    db.close();
    return rows;
}
exports.getOrganizationBankRecordStats = getOrganizationBankRecordStats;
function addOrganizationBankRecord(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const record = db.prepare("select recordIndex, recordDelete_timeMillis" +
        " from OrganizationBankRecords" +
        " where organizationID = ?" +
        " and accountNumber = ?" +
        " and bankingYear = ?" +
        " and bankingMonth = ?" +
        " and bankRecordType = ?")
        .get(reqBody.organizationID, reqBody.accountNumber, reqBody.bankingYear, reqBody.bankingMonth, reqBody.bankRecordType);
    if (record) {
        if (record.recordDelete_timeMillis) {
            const info = db.prepare("delete from OrganizationBankRecords" +
                " where organizationID = ?" +
                " and recordIndex = ?")
                .run(reqBody.organizationID, record.recordIndex);
            if (info.changes === 0) {
                db.close();
                return false;
            }
        }
        else {
            db.close();
            return false;
        }
    }
    const row = db.prepare("select ifnull(max(recordIndex), -1) as maxIndex" +
        " from OrganizationBankRecords" +
        " where organizationID = ?")
        .get(reqBody.organizationID);
    const newRecordIndex = row.maxIndex + 1;
    const nowMillis = Date.now();
    const info = db.prepare("insert into OrganizationBankRecords" +
        " (organizationID, recordIndex," +
        " accountNumber, bankingYear, bankingMonth, bankRecordType, recordIsNA, recordDate, recordNote," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.organizationID, newRecordIndex, reqBody.accountNumber, reqBody.bankingYear, reqBody.bankingMonth, reqBody.bankRecordType, reqBody.recordIsNA || 0, dateTimeFns.dateStringToInteger(reqBody.recordDateString), reqBody.recordNote, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return info.changes > 0;
}
exports.addOrganizationBankRecord = addOrganizationBankRecord;
function updateOrganizationBankRecord(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationBankRecords" +
        " set recordDate = ?," +
        " recordIsNA = ?," +
        " recordNote = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.recordDateString), reqBody.recordIsNA || 0, reqBody.recordNote, reqSession.user.userName, nowMillis, reqBody.organizationID, reqBody.recordIndex);
    db.close();
    return info.changes > 0;
}
exports.updateOrganizationBankRecord = updateOrganizationBankRecord;
function deleteOrganizationBankRecord(organizationID, recordIndex, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update OrganizationBankRecords" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where organizationID = ?" +
        " and recordIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(reqSession.user.userName, nowMillis, organizationID, recordIndex);
    db.close();
    return info.changes > 0;
}
exports.deleteOrganizationBankRecord = deleteOrganizationBankRecord;
