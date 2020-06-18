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
exports.getInactiveLocations = exports.mergeLocations = exports.restoreLocation = exports.deleteLocation = exports.updateLocation = exports.createLocation = exports.getLocation = exports.getLocations = void 0;
const licencesDB_1 = require("./licencesDB");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const dateTimeFns = __importStar(require("@cityssm/expressjs-server-js/dateTimeFns"));
function getLocations(reqSession, queryOptions) {
    const addCalculatedFieldsFn = function (ele) {
        ele.recordType = "location";
        ele.locationDisplayName =
            ele.locationName === "" ? ele.locationAddress1 : ele.locationName;
        ele.licences_endDateMaxString = dateTimeFns.dateIntegerToString(ele.licences_endDateMax);
        ele.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(ele.distributor_endDateMax);
        ele.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(ele.manufacturer_endDateMax);
        ele.canUpdate = licencesDB_1.canUpdateObject(ele, reqSession);
    };
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const sqlParams = [];
    let sqlWhereClause = " where lo.recordDelete_timeMillis is null";
    if (queryOptions.locationNameAddress && queryOptions.locationNameAddress !== "") {
        const locationNameAddressSplit = queryOptions.locationNameAddress.toLowerCase().split(" ");
        for (let index = 0; index < locationNameAddressSplit.length; index += 1) {
            sqlWhereClause += " and (instr(lower(lo.locationName), ?) or instr(lower(lo.locationAddress1),?))";
            sqlParams.push(locationNameAddressSplit[index]);
            sqlParams.push(locationNameAddressSplit[index]);
        }
    }
    if ("locationIsDistributor" in queryOptions && queryOptions.locationIsDistributor !== -1) {
        sqlWhereClause += " and lo.locationIsDistributor = ?";
        sqlParams.push(queryOptions.locationIsDistributor);
    }
    if ("locationIsManufacturer" in queryOptions && queryOptions.locationIsManufacturer !== -1) {
        sqlWhereClause += " and lo.locationIsManufacturer = ?";
        sqlParams.push(queryOptions.locationIsManufacturer);
    }
    let count = 0;
    if (queryOptions.limit !== -1) {
        count = db.prepare("select ifnull(count(*), 0) as cnt" +
            " from Locations lo" +
            sqlWhereClause)
            .get(sqlParams)
            .cnt;
    }
    let sql = "select lo.locationID, lo.locationName," +
        " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
        " lo.locationIsDistributor, lo.locationIsManufacturer," +
        " l.licences_endDateMax, coalesce(l.licences_count, 0) as licences_count," +
        " d.distributor_endDateMax, coalesce(d.distributor_count, 0) as distributor_count," +
        " m.manufacturer_endDateMax, coalesce(m.manufacturer_count, 0) as manufacturer_count" +
        " from Locations lo" +
        (" left join (" +
            "select locationID," +
            " count(licenceID) as licences_count, max(endDate) as licences_endDateMax" +
            " from LotteryLicences" +
            " where recordDelete_timeMillis is null" +
            " group by locationID" +
            ") l on lo.locationID = l.locationID") +
        (" left join (" +
            "select t.distributorLocationID," +
            " count(*) as distributor_count, max(l.endDate) as distributor_endDateMax" +
            " from LotteryLicenceTicketTypes t" +
            " left join LotteryLicences l on t.licenceID = l.licenceID" +
            " where t.recordDelete_timeMillis is null" +
            " group by t.distributorLocationID" +
            ") d on lo.locationID = d.distributorLocationID") +
        (" left join (" +
            "select t.manufacturerLocationID," +
            " count(*) as manufacturer_count, max(l.endDate) as manufacturer_endDateMax" +
            " from LotteryLicenceTicketTypes t" +
            " left join LotteryLicences l on t.licenceID = l.licenceID" +
            " where t.recordDelete_timeMillis is null" +
            " group by t.manufacturerLocationID" +
            ") m on lo.locationID = m.manufacturerLocationID") +
        sqlWhereClause +
        " group by lo.locationID, lo.locationName," +
        " lo.locationAddress1, lo.locationAddress2, lo.locationCity, lo.locationProvince," +
        " lo.locationIsDistributor, lo.locationIsManufacturer" +
        " order by case when lo.locationName = '' then lo.locationAddress1 else lo.locationName end";
    if (queryOptions.limit !== -1) {
        sql += " limit " + queryOptions.limit + " offset " + queryOptions.offset;
    }
    const rows = db.prepare(sql).all(sqlParams);
    db.close();
    rows.forEach(addCalculatedFieldsFn);
    return {
        count: (queryOptions.limit === -1 ? rows.length : count),
        locations: rows
    };
}
exports.getLocations = getLocations;
function getLocation(locationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const locationObj = db.prepare("select * from Locations" +
        " where locationID = ?")
        .get(locationID);
    if (locationObj) {
        locationObj.recordType = "location";
        locationObj.canUpdate = licencesDB_1.canUpdateObject(locationObj, reqSession);
    }
    db.close();
    locationObj.locationDisplayName =
        locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;
    return locationObj;
}
exports.getLocation = getLocation;
function createLocation(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("insert into Locations" +
        " (locationName, locationAddress1, locationAddress2, locationCity, locationProvince, locationPostalCode," +
        " locationIsDistributor, locationIsManufacturer," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.locationName, reqBody.locationAddress1, reqBody.locationAddress2, reqBody.locationCity, reqBody.locationProvince, reqBody.locationPostalCode, reqBody.locationIsDistributor || 0, reqBody.locationIsManufacturer || 0, reqSession.user.userName, nowMillis, reqSession.user.userName, nowMillis);
    db.close();
    return Number(info.lastInsertRowid);
}
exports.createLocation = createLocation;
function updateLocation(reqBody, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update Locations" +
        " set locationName = ?," +
        " locationAddress1 = ?," +
        " locationAddress2 = ?," +
        " locationCity = ?," +
        " locationProvince = ?," +
        " locationPostalCode = ?," +
        " locationIsDistributor = ?," +
        " locationIsManufacturer = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and locationID = ?")
        .run(reqBody.locationName, reqBody.locationAddress1, reqBody.locationAddress2, reqBody.locationCity, reqBody.locationProvince, reqBody.locationPostalCode, reqBody.locationIsDistributor ? 1 : 0, reqBody.locationIsManufacturer ? 1 : 0, reqSession.user.userName, nowMillis, reqBody.locationID);
    db.close();
    return info.changes > 0;
}
exports.updateLocation = updateLocation;
function deleteLocation(locationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update Locations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where recordDelete_timeMillis is null" +
        " and locationID = ?")
        .run(reqSession.user.userName, nowMillis, locationID);
    db.close();
    return info.changes > 0;
}
exports.deleteLocation = deleteLocation;
function restoreLocation(locationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const info = db.prepare("update Locations" +
        " set recordDelete_userName = null," +
        " recordDelete_timeMillis = null," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where recordDelete_timeMillis is not null" +
        " and locationID = ?")
        .run(reqSession.user.userName, nowMillis, locationID);
    db.close();
    return info.changes > 0;
}
exports.restoreLocation = restoreLocation;
function mergeLocations(targetLocationID, sourceLocationID, reqSession) {
    const db = better_sqlite3_1.default(licencesDB_1.dbPath);
    const nowMillis = Date.now();
    const locationAttributes = db.prepare("select max(locationIsDistributor) as locationIsDistributorMax," +
        " max(locationIsManufacturer) as locationIsManufacturerMax," +
        " count(locationID) as locationCount" +
        " from Locations" +
        " where recordDelete_timeMillis is null" +
        " and (locationID = ? or locationID = ?)")
        .get(targetLocationID, sourceLocationID);
    if (!locationAttributes) {
        db.close();
        return false;
    }
    if (locationAttributes.locationCount !== 2) {
        db.close();
        return false;
    }
    db.prepare("update Locations" +
        " set locationIsDistributor = ?," +
        " locationIsManufacturer = ?" +
        " where locationID = ?")
        .run(locationAttributes.locationIsDistributorMax, locationAttributes.locationIsManufacturerMax, targetLocationID);
    db.prepare("update LotteryLicences" +
        " set locationID = ?" +
        " where locationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(targetLocationID, sourceLocationID);
    db.prepare("update LotteryLicenceTicketTypes" +
        " set distributorLocationID = ?" +
        " where distributorLocationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(targetLocationID, sourceLocationID);
    db.prepare("update LotteryLicenceTicketTypes" +
        " set manufacturerLocationID = ?" +
        " where manufacturerLocationID = ?" +
        " and recordDelete_timeMillis is null")
        .run(targetLocationID, sourceLocationID);
    db.prepare("update Locations" +
        " set recordDelete_userName = ?," +
        " recordDelete_timeMillis = ?" +
        " where locationID = ?")
        .run(reqSession.user.userName, nowMillis, sourceLocationID);
    db.close();
    return true;
}
exports.mergeLocations = mergeLocations;
function getInactiveLocations(inactiveYears) {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - inactiveYears);
    const cutoffDateInteger = dateTimeFns.dateToInteger(cutoffDate);
    const db = better_sqlite3_1.default(licencesDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select lo.locationID, lo.locationName, lo.locationAddress1," +
        " lo.recordUpdate_timeMillis, lo.recordUpdate_userName," +
        " l.licences_endDateMax, d.distributor_endDateMax, m.manufacturer_endDateMax" +
        " from Locations lo" +
        (" left join (" +
            "select l.locationID, max(l.endDate) as licences_endDateMax from LotteryLicences l" +
            " where l.recordDelete_timeMillis is null" +
            " group by l.locationID" +
            ") l on lo.locationID = l.locationID") +
        (" left join (" +
            "select tt.distributorLocationID, max(l.endDate) as distributor_endDateMax" +
            " from LotteryLicenceTicketTypes tt" +
            " left join LotteryLicences l on tt.licenceID = l.licenceID" +
            " where l.recordDelete_timeMillis is null" +
            " group by tt.distributorLocationID" +
            ") d on lo.locationID = d.distributorLocationID") +
        (" left join (" +
            "select tt.manufacturerLocationID, max(l.endDate) as manufacturer_endDateMax" +
            " from LotteryLicenceTicketTypes tt" +
            " left join LotteryLicences l on tt.licenceID = l.licenceID" +
            " where l.recordDelete_timeMillis is null" +
            " group by tt.manufacturerLocationID" +
            ") m on lo.locationID = m.manufacturerLocationID") +
        " where lo.recordDelete_timeMillis is null" +
        " and max(ifnull(l.licences_endDateMax, 0), ifnull(d.distributor_endDateMax, 0), ifnull(m.manufacturer_endDateMax, 0)) <= ?" +
        " order by lo.locationName, lo.locationAddress1, lo.locationID")
        .all(cutoffDateInteger);
    db.close();
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const locationObj = rows[rowIndex];
        locationObj.locationDisplayName =
            locationObj.locationName === "" ? locationObj.locationAddress1 : locationObj.locationName;
        locationObj.recordUpdate_dateString = dateTimeFns.dateToString(new Date(locationObj.recordUpdate_timeMillis));
        locationObj.licences_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.licences_endDateMax || 0);
        locationObj.distributor_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.distributor_endDateMax || 0);
        locationObj.manufacturer_endDateMaxString = dateTimeFns.dateIntegerToString(locationObj.manufacturer_endDateMax || 0);
    }
    return rows;
}
exports.getInactiveLocations = getInactiveLocations;
