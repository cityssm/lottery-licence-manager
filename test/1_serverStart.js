import * as assert from "assert";
import puppeteer from "puppeteer";
import * as http from "http";
import { app } from "../app.js";
import * as configFunctions from "../helpers/functions.config.js";
import { getLicences } from "../helpers/licencesDB/getLicences.js";
import { getAllUsers } from "../helpers/usersDB/getAllUsers.js";
import { createUser } from "../helpers/usersDB/createUser.js";
import { inactivateUser } from "../helpers/usersDB/inactivateUser.js";
import { updateUserProperty } from "../helpers/usersDB/updateUserProperty.js";
import { fakeViewOnlySession, userName } from "./_globals.js";
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
        inactivateUser(userName);
        password = await createUser({
            userName,
            firstName: "Test",
            lastName: "User"
        });
        updateUserProperty({
            userName,
            propertyName: "isAdmin",
            propertyValue: "false"
        });
        updateUserProperty({
            userName,
            propertyName: "canUpdate",
            propertyValue: "true"
        });
        updateUserProperty({
            userName,
            propertyName: "canCreate",
            propertyValue: "true"
        });
    });
    after(() => {
        inactivateUser(userName);
        try {
            httpServer.close();
        }
        catch (_a) {
        }
    });
    it("Ensure server starts on port " + portNumber.toString(), () => {
        assert.ok(serverStarted);
    });
    describe("databases", () => {
        it("Ensure licences.db exists", () => {
            assert.ok(getLicences({}, fakeViewOnlySession, { includeOrganization: false, limit: 1, offset: 0 }));
        });
        it("Ensure users.db exists", () => {
            assert.ok(getAllUsers());
        });
    });
    const appURL = "http://localhost:" + portNumber.toString() + configFunctions.getProperty("reverseProxy.urlPrefix");
    describe("simple page tests", () => {
        const docsURL = appURL + "/docs";
        it("should load docs page - " + docsURL, (done) => {
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(docsURL);
                await browser.close();
            })()
                .catch((error) => {
                console.log(error);
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
                    await page.type("#login--userName", userName);
                    await page.focus("#login--password");
                    await page.type("#login--password", password);
                    const loginFormElement = await page.$("#form--login");
                    await loginFormElement.evaluate((formElement) => {
                        formElement.submit();
                    });
                    await page.waitForNavigation();
                    const response = await page.goto(appURL + pageURLs.goto);
                    if (response.ok) {
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
