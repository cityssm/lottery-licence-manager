"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const puppeteer = require("puppeteer");
const http = require("http");
const app = require("../app");
const configFns = require("../helpers/configFns");
const getLicences_1 = require("../helpers/licencesDB/getLicences");
const getAllUsers_1 = require("../helpers/usersDB/getAllUsers");
const createUser_1 = require("../helpers/usersDB/createUser");
const inactivateUser_1 = require("../helpers/usersDB/inactivateUser");
const updateUserProperty_1 = require("../helpers/usersDB/updateUserProperty");
const _globals_1 = require("./_globals");
describe("lottery-licence-manager", () => {
    const httpServer = http.createServer(app);
    const portNumber = 54333;
    let serverStarted = false;
    let password = "";
    before(async () => {
        httpServer.listen(portNumber);
        httpServer.on("listening", () => {
            serverStarted = true;
        });
        inactivateUser_1.inactivateUser(_globals_1.userName);
        password = await createUser_1.createUser({
            userName: _globals_1.userName,
            firstName: "Test",
            lastName: "User"
        });
        updateUserProperty_1.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "isAdmin",
            propertyValue: "false"
        });
        updateUserProperty_1.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "canUpdate",
            propertyValue: "true"
        });
        updateUserProperty_1.updateUserProperty({
            userName: _globals_1.userName,
            propertyName: "canCreate",
            propertyValue: "true"
        });
    });
    after(() => {
        inactivateUser_1.inactivateUser(_globals_1.userName);
        try {
            httpServer.close();
        }
        catch (_e) {
        }
    });
    it("Ensure server starts on port " + portNumber.toString(), () => {
        assert.ok(serverStarted);
    });
    describe("databases", () => {
        it("Ensure licences.db exists", () => {
            assert.ok(getLicences_1.getLicences({}, _globals_1.fakeViewOnlySession, { includeOrganization: false, limit: 1, offset: 0 }));
        });
        it("Ensure users.db exists", () => {
            assert.ok(getAllUsers_1.getAllUsers());
        });
    });
    const appURL = "http://localhost:" + portNumber.toString() + configFns.getProperty("reverseProxy.urlPrefix");
    describe("simple page tests", () => {
        const docsURL = appURL + "/docs";
        it("should load docs page - " + docsURL, (done) => {
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(docsURL);
                await browser.close();
            })()
                .catch((e) => {
                console.log(e);
            })
                .finally(() => {
                done();
            });
        });
    });
    describe("transaction page tests", () => {
        const pageTests = {
            reports: {
                goto: "/reports"
            },
            organizations: {
                goto: "/organizations",
                waitFor: "/organizations/doSearch"
            },
            newOrganization: {
                goto: "/organizations/new"
            },
            activeReminders: {
                goto: "/organizations/reminders"
            },
            organizationCleanup: {
                goto: "/organizations/cleanup",
                waitFor: "/organizations/doGetInactive"
            },
            organizationRecovery: {
                goto: "/organizations/recovery"
            },
            licences: {
                goto: "/licences",
                waitFor: "/licences/doSearch"
            },
            newLicence: {
                goto: "/licences/new"
            },
            licenceTypes: {
                goto: "/licences/licenceTypes",
                waitFor: "/licences/doGetLicenceTypeSummary"
            },
            activeLicenceSummary: {
                goto: "/licences/activeSummary",
                waitFor: "/licences/doGetActiveLicenceSummary"
            },
            events: {
                goto: "/events",
                waitFor: "/events/doSearch"
            },
            eventsByWeek: {
                goto: "/events/byWeek",
                waitFor: "/events/doGetEventsByWeek"
            },
            recentlyUpdatedEvents: {
                goto: "/events/recent"
            },
            outstandingEvents: {
                goto: "/events/outstanding",
                waitFor: "/events/doGetOutstandingEvents"
            },
            eventFinancialSummary: {
                goto: "/events/financials",
                waitFor: "/events/doGetFinancialSummary"
            },
            locations: {
                goto: "/locations",
                waitFor: "/locations/doGetLocations"
            },
            newLocation: {
                goto: "/locations/new"
            },
            locationCleanup: {
                goto: "/locations/cleanup",
                waitFor: "/locations/doGetInactive"
            }
        };
        for (const pageName of Object.keys(pageTests)) {
            it("should login, navigate to " + pageName + ", and log out", (done) => {
                const pageURLs = pageTests[pageName];
                (async () => {
                    let success = false;
                    const browser = await puppeteer.launch();
                    const page = await browser.newPage();
                    await page.goto(appURL);
                    await page.focus("#login--userName");
                    await page.type("#login--userName", _globals_1.userName);
                    await page.focus("#login--password");
                    await page.type("#login--password", password);
                    const loginFormEle = await page.$("#form--login");
                    await loginFormEle.evaluate((formEle) => {
                        formEle.submit();
                    });
                    await page.waitForNavigation();
                    const res = await page.goto(appURL + pageURLs.goto);
                    if (res.ok) {
                        success = true;
                    }
                    if (pageURLs.waitFor) {
                        await page.waitForTimeout(1000);
                    }
                    await page.goto(appURL + "/logout");
                    await browser.close();
                    if (success) {
                        assert.ok(true);
                    }
                    else {
                        assert.fail();
                    }
                })()
                    .finally(() => {
                    done();
                });
            });
        }
    });
});
