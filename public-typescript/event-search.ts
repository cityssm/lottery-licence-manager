/* eslint-disable unicorn/filename-case, unicorn/prefer-module */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");

  const formElement = document.querySelector("#form--filters") as HTMLFormElement;

  const limitElement = document.querySelector("#filter--limit") as HTMLInputElement;
  const offsetElement = document.querySelector("#filter--offset") as HTMLInputElement;

  const resultsElement = document.querySelector("#container--events") as HTMLElement;

  const doEventSearchFunction = () => {

    const currentLimit = Number.parseInt(limitElement.value, 10);
    const currentOffset = Number.parseInt(offsetElement.value, 10);

    resultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading events..." +
      "</p>";

    cityssm.postJSON(urlPrefix + "/events/doSearch",
      formElement,
      (eventResults: { count: number; events: llmTypes.LotteryEvent[] }) => {

        const eventList = eventResults.events;

        if (eventList.length === 0) {

          resultsElement.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "Your search returned no results." +
            "</div>" +
            "</div>";

          return;
        }

        const tbodyElement = document.createElement("tbody");

        for (const eventObject of eventList) {

          const licenceType: string = exports.config_licenceTypes[eventObject.licenceTypeKey] || eventObject.licenceTypeKey;

          const eventURL = urlPrefix + "/events/" + eventObject.licenceID.toString() + "/" + eventObject.eventDate.toString();

          const trElement = document.createElement("tr");

          trElement.innerHTML =
            ("<td>" +
              "<a href=\"" + cityssm.escapeHTML(eventURL) + "\">" +
              eventObject.eventDateString +
              "</a>" +
              "</td>") +
            ("<td>" +
              cityssm.escapeHTML(eventObject.externalLicenceNumber) + "<br />" +
              "<small>Licence #" + eventObject.licenceID.toString() + "</small>" +
              "</td>") +
            ("<td>" +
              cityssm.escapeHTML(eventObject.organizationName) +
              "</td>") +
            ("<td>" +
              licenceType + "<br />" +
              "<small>" + cityssm.escapeHTML(eventObject.licenceDetails) + "</small>" +
              "</td>") +
            ("<td>" +
              (eventObject.locationDisplayName
                ? cityssm.escapeHTML(eventObject.locationDisplayName)
                : "<span class=\"has-text-grey\">(No Location)</span>") + "<br />" +
              "<small>" + eventObject.startTimeString +
              (eventObject.startTimeString === eventObject.endTimeString ? "" : " to " + eventObject.endTimeString) +
              "</small>" +
              "</td>") +
            ("<td class=\"is-hidden-print has-text-right\">" +
              (eventObject.canUpdate
                ? "<a class=\"button is-small\" href=\"" + cityssm.escapeHTML(eventURL) + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a>"
                : "") +
              "</td>");

          tbodyElement.append(trElement);
        }

        cityssm.clearElement(resultsElement);

        const tableElement = document.createElement("table");
        tableElement.className = "table is-fullwidth is-striped is-hoverable has-sticky-header";

        tableElement.innerHTML = "<thead>" +
          "<tr>" +
          "<th>Event Date</th>" +
          "<th>Licence</th>" +
          "<th>Organization</th>" +
          "<th>Licence Type</th>" +
          "<th>Location</th>" +
          "<th></th>" +
          "</tr>" +
          "</thead>";

        tableElement.append(tbodyElement);

        resultsElement.append(tableElement);

        resultsElement.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
          "<div class=\"level-left has-text-weight-bold\">" +
          "Displaying events " +
          (currentOffset + 1).toString() +
          " to " +
          Math.min(currentLimit + currentOffset, eventResults.count).toString() +
          " of " +
          eventResults.count.toString() +
          "</div>" +
          "</div>");

        if (currentLimit < eventResults.count) {

          const paginationElement = document.createElement("nav");
          paginationElement.className = "level-right is-hidden-print";
          paginationElement.setAttribute("role", "pagination");
          paginationElement.setAttribute("aria-label", "pagination");

          if (currentOffset > 0) {

            const previousElement = document.createElement("a");
            previousElement.className = "button";
            previousElement.textContent = "Previous";
            previousElement.addEventListener("click", (clickEvent) => {

              clickEvent.preventDefault();
              offsetElement.value = Math.max(0, currentOffset - currentLimit).toString();
              doEventSearchFunction();

            });

            paginationElement.append(previousElement);
          }

          if (currentLimit + currentOffset < eventResults.count) {

            const nextElement = document.createElement("a");
            nextElement.className = "button ml-3";

            nextElement.innerHTML =
              "<span>Next Events</span>" +
              "<span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";

            nextElement.addEventListener("click", (clickEvent) => {

              clickEvent.preventDefault();
              offsetElement.value = (currentOffset + currentLimit).toString();
              doEventSearchFunction();
            });

            paginationElement.append(nextElement);
          }

          resultsElement.querySelector(".level").append(paginationElement);
        }
      }
    );
  };

  const resetOffsetAndDoEventSearchFunction = () => {
    offsetElement.value = "0";
    doEventSearchFunction();
  };

  formElement.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });

  const inputElements = formElement.querySelectorAll(".input, .select select");

  for (const inputElement of inputElements) {
    inputElement.addEventListener("change", resetOffsetAndDoEventSearchFunction);
  }

  resetOffsetAndDoEventSearchFunction();
})();
