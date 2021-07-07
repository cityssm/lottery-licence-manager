/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { DateDiff } from "@cityssm/date-diff/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const dateDiff: DateDiff = exports.dateDiff;

  const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");

  const formElement = document.querySelector("#form--outstandingEvents") as HTMLFormElement;
  const tbodyElement = document.querySelector("#tbody--outstandingEvents") as HTMLElement;

  const getOutstandingEventsFunction = () => {

    cityssm.clearElement(tbodyElement);

    cityssm.postJSON(urlPrefix + "/events/doGetOutstandingEvents",
      formElement,
      (outstandingEvents: llmTypes.LotteryEvent[]) => {

        const nowDate = new Date();

        let currentOrganizationID = -1;

        for (const outstandingEventObject of outstandingEvents) {

          if (currentOrganizationID !== outstandingEventObject.organizationID) {

            currentOrganizationID = outstandingEventObject.organizationID;

            tbodyElement.insertAdjacentHTML("beforeend", "<tr>" +
              "<th class=\"has-background-grey-lighter\" colspan=\"9\">" +
              "<h2 class=\"title is-4\">" + cityssm.escapeHTML(outstandingEventObject.organizationName) + "</h2>" +
              "</th>" +
              "</tr>");

          }

          const trElement = document.createElement("tr");

          const licenceURL = urlPrefix + "/licences/" + outstandingEventObject.licenceID.toString();

          trElement.insertAdjacentHTML("beforeend", "<td>" +
            "<a href=\"" + cityssm.escapeHTML(licenceURL) + "\"" +
            " data-tooltip=\"View Licence\" target=\"_blank\">" +
            cityssm.escapeHTML(outstandingEventObject.externalLicenceNumber) + "<br / > " +
            "<small>Licence #" + outstandingEventObject.licenceID.toString() + "</small>" +
            "</a>" +
            "</td>");

          trElement.insertAdjacentHTML("beforeend", "<td>" + cityssm.escapeHTML(outstandingEventObject.licenceType) + "</td>");

          const eventURL = urlPrefix + "/events/" +
            outstandingEventObject.licenceID.toString() + "/" +
            outstandingEventObject.eventDate.toString();

          const eventDate = cityssm.dateStringToDate(outstandingEventObject.eventDateString);

          trElement.insertAdjacentHTML("beforeend", "<td>" +
            "<a href=\"" + cityssm.escapeHTML(eventURL) + "\" data-tooltip=\"View Event\" target=\"_blank\">" +
            cityssm.escapeHTML(outstandingEventObject.eventDateString) +
            "</a>" +
            (eventDate < nowDate
              ? "<br /><span class=\"is-size-7\">" + dateDiff(eventDate, nowDate).formatted + " ago</span>"
              : "") +
            "</td>");

          trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (outstandingEventObject.reportDate === null || outstandingEventObject.reportDate === 0
              ? "<span class=\"icon\" data-tooltip=\"Report Date Not Recorded\">" +
              "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Report Date Not Recorded</span>"
              : outstandingEventObject.reportDateString) +
            "</td>");

          trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (outstandingEventObject.bank_name_isOutstanding
              ? "<span class=\"icon\" data-tooltip=\"Banking Information Outstanding\">" +
              "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Banking Information Outstanding</span>"
              : "<span class=\"icon\" data-tooltip=\"Banking Information Recorded\">" +
              "<i class=\"fas fa-check has-text-success\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Banking Information Recorded</span>") +
            "</td>");

          trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +

            (outstandingEventObject.costs_receiptsSum === null || outstandingEventObject.costs_receiptsSum === 0

              ? "<span class=\"icon\" data-tooltip=\"Receipts Amount Outstanding\">" +
              "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Receipts Amount Outstanding</span>"

              : "<span class=\"icon\" data-tooltip=\"Receipts Amount Recorded\">" +
              "<i class=\"fas fa-check has-text-success\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Receipts Amount Recorded</span>") +

            "</td>");

          tbodyElement.append(trElement);
        }
      });
  };

  document.querySelector("#filter--licenceTypeKey").addEventListener("change", getOutstandingEventsFunction);
  document.querySelector("#filter--licenceTypeKey").addEventListener("change", getOutstandingEventsFunction);

  getOutstandingEventsFunction();
})();
