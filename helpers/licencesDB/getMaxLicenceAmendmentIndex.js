export function getMaxLicenceAmendmentIndexWithDB(database, licenceID) {
    const result = database
        .prepare(`select amendmentIndex
        from LotteryLicenceAmendments
        where licenceID = ?
        order by amendmentIndex desc
        limit 1`)
        .get(licenceID);
    return result === undefined ? -1 : result.amendmentIndex;
}
