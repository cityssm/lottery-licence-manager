import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const filterExternalLicenceNumberEle =
    document.getElementById("filter--externalLicenceNumber") as HTMLInputElement;

  const filterLicenceTypeKeyEle = document.getElementById("filter--licenceTypeKey") as HTMLSelectElement;
  const filterOrganizationNameEle = document.getElementById("filter--organizationName") as HTMLInputElement;
  const filterLocationNameEle = document.getElementById("filter--locationName") as HTMLInputElement;
  const filterYearEle = document.getElementById("filter--year") as HTMLSelectElement;

  const resultsEle = document.getElementById("container--events");

  const getEventsFn = () => {

    resultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading events..." +
      "</p>";

    cityssm.postJSON("events/doSearch", {
        externalLicenceNumber: filterExternalLicenceNumberEle.value,
        licenceTypeKey: filterLicenceTypeKeyEle.value,
        organizationName: filterOrganizationNameEle.value,
        locationName: filterLocationNameEle.value,
        eventYear: filterYearEle.value
      },
      (eventList: llmTypes.LotteryEvent[]) => {

        if (eventList.length === 0) {

          resultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "Your search returned no results." +
            "</div>" +
            "</div>";

          return;
        }

        const tbodyEle = document.createElement("tbody");

        for (const eventObj of eventList) {

          const licenceType: string = exports.config_licenceTypes[eventObj.licenceTypeKey] || eventObj.licenceTypeKey;

          const eventURL = "/events/" + eventObj.licenceID.toString() + "/" + eventObj.eventDate.toString();

          const trEle = document.createElement("tr");

          trEle.innerHTML =
            ("<td>" +
              "<a href=\"" + eventURL + "\">" +
              eventObj.eventDateString +
              "</a>" +
              "</td>") +
            ("<td>" +
              cityssm.escapeHTML(eventObj.externalLicenceNumber) + "<br />" +
              "<small>Licence #" + eventObj.licenceID.toString() + "</small>" +
              "</td>") +
            ("<td>" +
              cityssm.escapeHTML(eventObj.organizationName) +
              "</td>") +
            ("<td>" +
              licenceType + "<br />" +
              "<small>" + cityssm.escapeHTML(eventObj.licenceDetails) + "</small>" +
              "</td>") +
            ("<td>" +
              cityssm.escapeHTML(eventObj.locationDisplayName) + "<br />" +
              "<small>" + eventObj.startTimeString +
              (eventObj.startTimeString === eventObj.endTimeString ? "" : " to " + eventObj.endTimeString) +
              "</small>" +
              "</td>") +
            ("<td class=\"is-hidden-print has-text-right\">" +
              (eventObj.canUpdate
                ? "<a class=\"button is-small\" href=\"" + eventURL + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a>"
                : "") +
              "</td>");

          tbodyEle.appendChild(trEle);
        }

        cityssm.clearElement(resultsEle);

        const tableEle = document.createElement("table");
        tableEle.className = "table is-fullwidth is-striped is-hoverable";

        tableEle.innerHTML = "<thead>" +
          "<tr>" +
          "<th>Event Date</th>" +
          "<th>Licence</th>" +
          "<th>Organization</th>" +
          "<th>Licence Type</th>" +
          "<th>Location</th>" +
          "<th></th>" +
          "</tr>" +
          "</thead>";

        tableEle.appendChild(tbodyEle);

        resultsEle.appendChild(tableEle);
      }
    );
  };

  filterExternalLicenceNumberEle.addEventListener("change", getEventsFn);
  filterLicenceTypeKeyEle.addEventListener("change", getEventsFn);
  filterOrganizationNameEle.addEventListener("change", getEventsFn);
  filterLocationNameEle.addEventListener("change", getEventsFn);
  filterYearEle.addEventListener("change", getEventsFn);

  getEventsFn();
})();
