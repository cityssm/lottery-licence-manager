"use strict";
const express_1 = require("express");
const router = express_1.Router();
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const licencesDB = require("../helpers/licencesDB");
const licencesDBOrganizations = require("../helpers/licencesDB-organizations");
router.get("/", (_req, res) => {
    const eventTableStats = licencesDB.getEventTableStats();
    res.render("event-search", {
        headTitle: "Lottery Events",
        eventTableStats: eventTableStats
    });
});
router.post("/doSearch", (req, res) => {
    res.json(licencesDB.getEvents(req.body, req.session));
});
router.get("/byWeek", (_req, res) => {
    res.render("event-byWeek", {
        headTitle: "Events By Week"
    });
});
router.post("/doGetEventsByWeek", (req, res) => {
    const dateWithinWeek = dateTimeFns.dateStringToDate(req.body.eventDate);
    dateWithinWeek.setDate(dateWithinWeek.getDate() - dateWithinWeek.getDay());
    const startDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);
    dateWithinWeek.setDate(dateWithinWeek.getDate() + 6);
    const endDateInteger = dateTimeFns.dateToInteger(dateWithinWeek);
    const activity = licencesDB.getLicenceActivityByDateRange(startDateInteger, endDateInteger, req.body);
    res.json(activity);
});
router.get("/recent", (req, res) => {
    const records = licencesDB.getRecentlyUpdateEvents(req.session);
    res.render("event-recent", {
        headTitle: "Recently Updated Events",
        records: records
    });
});
router.get("/outstanding", (_req, res) => {
    res.render("event-outstanding", {
        headTitle: "Outstanding Events"
    });
});
router.post("/doGetOutstandingEvents", (req, res) => {
    const events = licencesDB.getOutstandingEvents(req.body, req.session);
    res.json(events);
});
router.get("/financials", (_req, res) => {
    const eventTableStats = licencesDB.getEventTableStats();
    const eventDate = new Date();
    eventDate.setMonth(eventDate.getMonth() - 1);
    eventDate.setDate(1);
    const eventDateStartString = dateTimeFns.dateToString(eventDate);
    eventDate.setMonth(eventDate.getMonth() + 1);
    eventDate.setDate(0);
    const eventDateEndString = dateTimeFns.dateToString(eventDate);
    res.render("event-financials", {
        headTitle: "Financial Summary",
        pageContainerIsFullWidth: true,
        eventYearMin: (eventTableStats.eventYearMin || new Date().getFullYear() + 1),
        eventDateStartString: eventDateStartString,
        eventDateEndString: eventDateEndString
    });
});
router.post("/doGetFinancialSummary", (req, res) => {
    const summary = licencesDB.getEventFinancialSummary(req.body);
    res.json(summary);
});
router.post("/doGetPastBankInformation", (req, res) => {
    const bankInfoList = licencesDB.getPastEventBankingInformation(req.body.licenceID);
    res.json(bankInfoList);
});
router.post("/doSave", (req, res) => {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    const changeCount = licencesDB.updateEvent(req.body, req.session);
    if (changeCount) {
        res.json({
            success: true,
            message: "Event updated successfully."
        });
    }
    else {
        res.json({
            success: false,
            message: "Record Not Saved"
        });
    }
});
router.post("/doDelete", (req, res) => {
    if (!req.session.user.userProperties.canUpdate) {
        res
            .status(403)
            .json({
            success: false,
            message: "Forbidden"
        });
        return;
    }
    if (req.body.licenceID === "" || req.body.eventDate === "") {
        res.json({
            success: false,
            message: "Licence ID or Event Date Unavailable"
        });
    }
    else {
        const changeCount = licencesDB.deleteEvent(req.body.licenceID, req.body.eventDate, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Event Deleted"
            });
        }
        else {
            res.json({
                success: false,
                message: "Event Not Deleted"
            });
        }
    }
});
router.get("/:licenceID/:eventDate", (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    const eventObj = licencesDB.getEvent(licenceID, eventDate, req.session);
    if (!eventObj) {
        res.redirect("/events/?error=eventNotFound");
        return;
    }
    const licence = licencesDB.getLicence(licenceID, req.session);
    const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);
    res.render("event-view", {
        headTitle: "Event View",
        event: eventObj,
        licence: licence,
        organization: organization
    });
});
router.get("/:licenceID/:eventDate/edit", (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    if (!req.session.user.userProperties.canUpdate) {
        res.redirect("/events/" + licenceID + "/" + eventDate + "/?error=accessDenied");
        return;
    }
    const eventObj = licencesDB.getEvent(licenceID, eventDate, req.session);
    if (!eventObj) {
        res.redirect("/events/?error=eventNotFound");
        return;
    }
    if (!eventObj.canUpdate) {
        res.redirect("/events/" + licenceID + "/" + eventDate + "/?error=accessDenied");
        return;
    }
    const licence = licencesDB.getLicence(licenceID, req.session);
    const organization = licencesDBOrganizations.getOrganization(licence.organizationID, req.session);
    res.render("event-edit", {
        headTitle: "Event Update",
        event: eventObj,
        licence: licence,
        organization: organization
    });
});
router.get("/:licenceID/:eventDate/poke", (req, res) => {
    const licenceID = parseInt(req.params.licenceID, 10);
    const eventDate = parseInt(req.params.eventDate, 10);
    if (req.session.user.userProperties.isAdmin) {
        licencesDB.pokeEvent(licenceID, eventDate, req.session);
    }
    res.redirect("/events/" + licenceID + "/" + eventDate);
});
module.exports = router;
