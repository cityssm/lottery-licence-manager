import * as configFns from "../../helpers/configFns.js";
import * as licencesDB from "../../helpers/licencesDB.js";
import { rawToCSV } from "@cityssm/expressjs-server-js/stringFns.js";
import reportDefinitions from "../../helpers/reportDefinitions/reportDefinitions.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (req, res) => {
    const reportName = req.params.reportName;
    if (!reportDefinitions[reportName]) {
        res.redirect(urlPrefix + "/reports/?error=reportNotFound");
        return;
    }
    const def = reportDefinitions[reportName];
    const sql = def.sql;
    const params = def.params
        ? def.params(req)
        : [];
    const functions = def.functions
        ? def.functions()
        : new Map();
    const rowsColumnsObj = licencesDB.getRawRowsColumns(sql, params, functions);
    const csv = rawToCSV(rowsColumnsObj);
    res.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
};
export default handler;
