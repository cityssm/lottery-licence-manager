/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const inactiveYearsFilterElement = document.querySelector("#filter--inactiveYears") as HTMLSelectElement;

  const searchResultsElement = document.querySelector("#container--searchResults") as HTMLElement;

  const confirmDeleteLocationFunction = (clickEvent: Event) => {

    const buttonElement = clickEvent.currentTarget as HTMLButtonElement;
    const locationDisplayName = cityssm.escapeHTML(buttonElement.dataset.locationDisplayName);

    const deleteFunction = () => {

      const locationID = buttonElement.dataset.locationId;

      cityssm.postJSON(urlPrefix + "/locations/doDelete", {
          locationID
        },
        (responseJSON: {
          success: boolean;
          message: string;
        }) => {

          if (responseJSON.success) {
            cityssm.alertModal(responseJSON.message, "", "OK", "success");
            buttonElement.closest("tr").remove();

          } else {
            cityssm.alertModal(responseJSON.message, "", "OK", "danger");
          }
        });
    };

    cityssm.confirmModal(
      "Delete Location?",
      `Are you sure you want delete ${cityssm.escapeHTML(locationDisplayName)}?`,
      "Yes, Delete",
      "danger",
      deleteFunction
    );
  };

  const getInactiveLocationsFunction = () => {

    searchResultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading locations...</em>" +
      "</p>";

    cityssm.postJSON(urlPrefix + "/locations/doGetInactive", {
      inactiveYears: inactiveYearsFilterElement.value
    },
      (inactiveList: llmTypes.Location[]) => {

        if (inactiveList.length === 0) {

          searchResultsElement.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">" +
            "There are no inactive locations to report." +
            "</p>" +
            "</div>";

          return;

        }

        const tableElement = document.createElement("table");
        tableElement.className = "table is-fullwidth is-striped is-hoverable has-sticky-header";

        tableElement.innerHTML = "<thead>" +
          "<tr>" +
          "<th>Location</th>" +
          "<th class=\"has-text-centered\">Last Licence End Date</th>" +
          "<th class=\"has-text-centered\">Last Updated</th>" +
          "<th><span class=\"sr-only\">Delete</span></th>" +
          "</tr>" +
          "</thead>";

        const tbodyElement = document.createElement("tbody");

        for (const locationObject of inactiveList) {

          const trElement = document.createElement("tr");

          const safeLocationDisplayName = cityssm.escapeHTML(locationObject.locationDisplayName);

          trElement.insertAdjacentHTML("beforeend", "<td>" +
            "<a data-tooltip=\"View Location\"" +
            " href=\"" + cityssm.escapeHTML(urlPrefix) + "/locations/" + locationObject.locationID.toString() + "\">" +
            safeLocationDisplayName +
            "</a>" +
            (locationObject.locationDisplayName === locationObject.locationAddress1 ? "" : "<br />" +
              "<small>" + cityssm.escapeHTML(locationObject.locationAddress1) + "</small>") +
            "</td>");

          let dateMax = locationObject.licences_endDateMax;
          let dateMaxString = locationObject.licences_endDateMaxString;
          let dateTag = "Licence Location";

          if (locationObject.distributor_endDateMax && (!dateMax || dateMax < locationObject.distributor_endDateMax)) {

            dateMax = locationObject.distributor_endDateMax;
            dateMaxString = locationObject.distributor_endDateMaxString;
            dateTag = "Distributor";
          }

          if (locationObject.manufacturer_endDateMax && (!dateMax || dateMax < locationObject.manufacturer_endDateMax)) {

            dateMax = locationObject.manufacturer_endDateMax;
            dateMaxString = locationObject.manufacturer_endDateMaxString;
            dateTag = "Manufacturer";
          }

          trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (dateMax
              ? dateMaxString + "<br /><span class=\"tag is-light is-info\">" + dateTag + "</span>"
              : "<span class=\"tag is-light is-danger\">No Licences</span>") +
            "</td>");

          trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            "<span data-tooltip=\"Updated by " + locationObject.recordUpdate_userName + "\">" +
            locationObject.recordUpdate_dateString +
            "</span>" +
            "</td>");

          trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
            "<button class=\"button is-small is-danger\"" +
            " data-tooltip=\"Delete Location\"" +
            " data-location-id=\"" + locationObject.locationID.toString() + "\"" +
            " data-location-display-name=\"" + safeLocationDisplayName + "\" type=\"button\">" +
            "<span class=\"icon\"><i class=\"fas fa-trash\" aria-hidden=\"true\"></i></span> <span>Delete</span>" +
            "</button>" +
            "</td>");

          trElement.querySelector("button").addEventListener("click", confirmDeleteLocationFunction);

          tbodyElement.append(trElement);

        }

        tableElement.append(tbodyElement);

        cityssm.clearElement(searchResultsElement);

        searchResultsElement.append(tableElement);
      });

  };

  inactiveYearsFilterElement.addEventListener("change", getInactiveLocationsFunction);

  getInactiveLocationsFunction();
})();
