import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  const formEle = document.getElementById("form--outstandingEvents") as HTMLFormElement;
  const tbodyEle = document.getElementById("tbody--outstandingEvents");

  const getOutstandingEventsFn = () => {

    cityssm.clearElement(tbodyEle);

    cityssm.postJSON(urlPrefix + "/events/doGetOutstandingEvents",
      formEle,
      (outstandingEvents: llmTypes.LotteryEvent[]) => {

        let currentOrganizationID = -1;

        for (const outstandingEventObj of outstandingEvents) {

          if (currentOrganizationID !== outstandingEventObj.organizationID) {

            currentOrganizationID = outstandingEventObj.organizationID;

            tbodyEle.insertAdjacentHTML("beforeend", "<tr>" +
              "<th class=\"has-background-grey-lighter\" colspan=\"9\">" +
              "<h2 class=\"title is-4\">" + cityssm.escapeHTML(outstandingEventObj.organizationName) + "</h2>" +
              "</th>" +
              "</tr>");

          }

          const trEle = document.createElement("tr");

          const licenceURL = urlPrefix + "/licences/" + outstandingEventObj.licenceID.toString();

          trEle.insertAdjacentHTML("beforeend", "<td>" +
            "<a href=\"" + cityssm.escapeHTML(licenceURL) + "\"" +
            " data-tooltip=\"View Licence\" target=\"_blank\">" +
            cityssm.escapeHTML(outstandingEventObj.externalLicenceNumber) + "<br / > " +
            "<small>Licence #" + outstandingEventObj.licenceID.toString() + "</small>" +
            "</a>" +
            "</td>");

          trEle.insertAdjacentHTML("beforeend", "<td>" + cityssm.escapeHTML(outstandingEventObj.licenceType) + "</td>");

          const eventURL = urlPrefix + "/events/" +
            outstandingEventObj.licenceID.toString() + "/" +
            outstandingEventObj.eventDate.toString();

          trEle.insertAdjacentHTML("beforeend", "<td>" +
            "<a href=\"" + cityssm.escapeHTML(eventURL) + "\" data-tooltip=\"View Event\" target=\"_blank\">" +
            cityssm.escapeHTML(outstandingEventObj.eventDateString) +
            "</a>" +
            "</td>");

          trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (outstandingEventObj.reportDate === null || outstandingEventObj.reportDate === 0
              ? "<span class=\"icon\" data-tooltip=\"Report Date Not Recorded\">" +
              "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Report Date Not Recorded</span>"
              : outstandingEventObj.reportDateString) +
            "</td>");

          trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (outstandingEventObj.bank_name_isOutstanding
              ? "<span class=\"icon\" data-tooltip=\"Banking Information Outstanding\">" +
              "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Banking Information Outstanding</span>"
              : "<span class=\"icon\" data-tooltip=\"Banking Information Recorded\">" +
              "<i class=\"fas fa-check has-text-success\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Banking Information Recorded</span>") +
            "</td>");

          trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +

            (outstandingEventObj.costs_receiptsSum === null || outstandingEventObj.costs_receiptsSum === 0

              ? "<span class=\"icon\" data-tooltip=\"Receipts Amount Outstanding\">" +
              "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Receipts Amount Outstanding</span>"

              : "<span class=\"icon\" data-tooltip=\"Receipts Amount Recorded\">" +
              "<i class=\"fas fa-check has-text-success\" aria-hidden=\"true\"></i>" +
              "</span>" +
              "<span class=\"sr-only\">Receipts Amount Recorded</span>") +

            "</td>");


          tbodyEle.insertAdjacentElement("beforeend", trEle);
        }
      });
  };

  document.getElementById("filter--licenceTypeKey").addEventListener("change", getOutstandingEventsFn);
  document.getElementById("filter--eventDateType").addEventListener("change", getOutstandingEventsFn);

  getOutstandingEventsFn();
})();
