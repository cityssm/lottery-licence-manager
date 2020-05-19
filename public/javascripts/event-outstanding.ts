import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/types";
declare const cityssm: cityssmGlobal;


(function() {

  const formEle = <HTMLFormElement>document.getElementById("form--outstandingEvents");
  const tbodyEle = document.getElementById("tbody--outstandingEvents");

  function getOutstandingEvents() {

    cityssm.clearElement(tbodyEle);

    cityssm.postJSON("/events/doGetOutstandingEvents", formEle, function(outstandingEvents) {

      let currentOrganizationID = -1;

      for (let eventIndex = 0; eventIndex < outstandingEvents.length; eventIndex += 1) {

        const outstandingEventObj = outstandingEvents[eventIndex];

        if (currentOrganizationID !== outstandingEventObj.organizationID) {

          currentOrganizationID = outstandingEventObj.organizationID;

          tbodyEle.insertAdjacentHTML("beforeend", "<tr>" +
            "<th class=\"has-background-grey-lighter\" colspan=\"9\">" +
            "<h2 class=\"title is-4\">" + cityssm.escapeHTML(outstandingEventObj.organizationName) + "</h2>" +
            "</th>" +
            "</tr>");

        }

        const trEle = document.createElement("tr");

        trEle.insertAdjacentHTML("beforeend", "<td>" +
          "<a href=\"/licences/" + outstandingEventObj.licenceID + "\" data-tooltip=\"View Licence\" target=\"_blank\">" +
          outstandingEventObj.externalLicenceNumber + "<br / > " +
          "<small>Licence #" + outstandingEventObj.licenceID + "</small>" +
          "</a>" +
          "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td>" + cityssm.escapeHTML(outstandingEventObj.licenceType) + "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td>" +
          "<a href=\"/events/" + outstandingEventObj.licenceID + "/" + outstandingEventObj.eventDate + "\" data-tooltip=\"View Event\" target=\"_blank\">" +
          outstandingEventObj.eventDateString +
          "</a>" +
          "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
          (outstandingEventObj.reportDate === null || outstandingEventObj.reportDate === 0 ?
            "<span class=\"icon\" data-tooltip=\"Report Date Not Recorded\">" +
            "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "<span class=\"sr-only\">Report Date Not Recorded</span>" :
            outstandingEventObj.reportDateString) +
          "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
          (outstandingEventObj.bank_name_isOutstanding ?
            "<span class=\"icon\" data-tooltip=\"Banking Information Outstanding\">" +
            "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "<span class=\"sr-only\">Banking Information Outstanding</span>" :
            "<span class=\"icon\" data-tooltip=\"Banking Information Recorded\">" +
            "<i class=\"fas fa-check has-text-success\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "<span class=\"sr-only\">Banking Information Recorded</span>") +
          "</td>");

        trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +

          (outstandingEventObj.costs_receipts === null || outstandingEventObj.costs_receipts === 0 ?

            "<span class=\"icon\" data-tooltip=\"Receipts Amount Outstanding\">" +
            "<i class=\"fas fa-times has-text-danger\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "<span class=\"sr-only\">Receipts Amount Outstanding</span>" :

            "<span class=\"icon\" data-tooltip=\"Receipts Amount Recorded\">" +
            "<i class=\"fas fa-check has-text-success\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "<span class=\"sr-only\">Receipts Amount Recorded</span>") +

          "</td>");


        tbodyEle.insertAdjacentElement("beforeend", trEle);

      }

    });

  }

  getOutstandingEvents();

  document.getElementById("filter--licenceTypeKey").addEventListener("change", getOutstandingEvents);
  document.getElementById("filter--eventDateType").addEventListener("change", getOutstandingEvents);

}());
