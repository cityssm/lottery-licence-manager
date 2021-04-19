import * as configFns from "../../helpers/configFns.js";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import { getLicences } from "../../helpers/licencesDB/getLicences.js";
import { getLocation } from "../../helpers/licencesDB/getLocation.js";
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
export const handler = (req, res, next) => {
    const locationID = Number(req.params.locationID);
    if (isNaN(locationID)) {
        return next();
    }
    const location = getLocation(locationID, req.session);
    if (!location) {
        return res.redirect(urlPrefix + "/locations/?error=locationNotFound");
    }
    if (!location.canUpdate) {
        return res.redirect(urlPrefix + "/locations/" + locationID.toString() + "/?error=accessDenied-noUpdate");
    }
    const licences = getLicences({
        locationID
    }, req.session, {
        includeOrganization: true,
        limit: -1
    }).licences;
    return res.render("location-edit", {
        headTitle: location.locationDisplayName,
        location,
        licences,
        currentDateInteger: dateTimeFns.dateToInteger(new Date()),
        isCreate: false
    });
};
