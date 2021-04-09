import * as assert from "assert";

import * as puppeteer from "puppeteer";

import * as http from "http";
import * as app from "../app";

import * as configFns from "../helpers/configFns";

import { getLicences } from "../helpers/licencesDB/getLicences";

import { getAllUsers } from "../helpers/usersDB/getAllUsers";
import { createUser } from "../helpers/usersDB/createUser";
import { inactivateUser } from "../helpers/usersDB/inactivateUser";
import { updateUserProperty } from "../helpers/usersDB/updateUserProperty";

import { fakeViewOnlySession, userName } from "./_globals";


describe("lottery-licence-manager", () => {

  const httpServer = http.createServer(app);
  const portNumber = 54333;

  let serverStarted = false;

  let password = "";

  before(() => {

    httpServer.listen(portNumber);

    httpServer.on("listening", () => {
      serverStarted = true;
    });

    // ensure the test user is not active
    inactivateUser(userName);

    password = createUser({
      userName,
      firstName: "Test",
      lastName: "User"
    }) as string;

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
    } catch (_e) {
      // ignore
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

    const pageTests: {
      [pageName: string]: {
        goto: string;
        waitFor?: string;
      };
    } = {
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

        (async() => {
          let success = false;

          const browser = await puppeteer.launch();
          const page = await browser.newPage();

          // Load the login page

          await page.goto(appURL);

          await page.focus("#login--userName");
          await page.type("#login--userName", userName);

          await page.focus("#login--password");
          await page.type("#login--password", password);

          const loginFormEle = await page.$("#form--login");
          await loginFormEle.evaluate((formEle: HTMLFormElement) => {
            formEle.submit();
          });

          await page.waitForNavigation();

          // Navigate to the page

          const res = await page.goto(appURL + pageURLs.goto);

          if (res.ok) {
            success = true;
          }

          if (pageURLs.waitFor) {
            await page.waitForTimeout(1000);
          }

          // Log out

          await page.goto(appURL + "/logout");

          await browser.close();

          if (success) {
            assert.ok(true);
          } else {
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
