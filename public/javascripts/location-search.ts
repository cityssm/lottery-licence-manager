import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type * as llmTypes from "../../helpers/llmTypes";


(function() {

  const formEle = <HTMLFormElement>document.getElementById("form--searchFilters");

  const limitEle = <HTMLInputElement>document.getElementById("filter--limit");
  const offsetEle = <HTMLInputElement>document.getElementById("filter--offset");

  const searchResultsEle = document.getElementById("container--searchResults");

  const canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";


  let displayedLocationList: llmTypes.Location[] = [];


  function renderLocationTrEle(locationObj: llmTypes.Location, locationIndex: number) {

    const trEle = document.createElement("tr");
    trEle.innerHTML = "<td></td>";

    const locationDisplayNameLinkEle = document.createElement("a");

    locationDisplayNameLinkEle.innerText = locationObj.locationDisplayName;
    locationDisplayNameLinkEle.href = "/locations/" + locationObj.locationID;
    trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", locationDisplayNameLinkEle);

    // Address

    const addressTdEle = document.createElement("td");

    addressTdEle.innerHTML =
      (locationObj.locationAddress1 === "" ?
        "" :
        cityssm.escapeHTML(locationObj.locationAddress1) + "<br />") +
      (locationObj.locationAddress2 === "" ?
        "" :
        "<small>" + cityssm.escapeHTML(locationObj.locationAddress2) + "</small><br />") +
      (locationObj.locationCity === "" ?
        "" :
        "<small>" + cityssm.escapeHTML(locationObj.locationCity) + ", " + locationObj.locationProvince + "</small>");

    trEle.insertAdjacentElement("beforeend", addressTdEle);


    trEle.insertAdjacentHTML(
      "beforeend",
      "<td class=\"has-text-centered\">" +
      (locationObj.licences_endDateMaxString === "" ?
        "<span class=\"has-text-grey\">Not Used</span>" :
        locationObj.licences_endDateMaxString) +
      "</td>"
    );


    trEle.insertAdjacentHTML(
      "beforeend",
      "<td class=\"has-text-centered\">" +
      (locationObj.locationIsManufacturer ?
        "<span data-tooltip=\"Manufacturer\">" +
        "<span class=\"tag is-success\">Yes</span><br />" +
        (locationObj.manufacturer_endDateMaxString === "" ? "<span class=\"has-text-grey\">Never Used</span>" : locationObj.manufacturer_endDateMaxString) +
        "</span>" :
        "<span class=\"sr-only\">No</span>"
      ) +
      "</td>"
    );


    trEle.insertAdjacentHTML(
      "beforeend",
      "<td class=\"has-text-centered\">" +
      (locationObj.locationIsDistributor ?
        "<span data-tooltip=\"Distributor\">" +
        "<span class=\"tag is-success\">Yes</span><br />" +
        (locationObj.distributor_endDateMaxString === "" ? "<span class=\"has-text-grey\">Never Used</span>" : locationObj.distributor_endDateMaxString) +
        "</span>" :
        "<span class=\"sr-only\">No</span>"
      ) +
      "</td>"
    );


    if (canCreate) {

      const canDeleteLocation = locationObj.canUpdate && locationObj.licences_count === 0 && locationObj.distributor_count === 0 && locationObj.manufacturer_count === 0;

      trEle.insertAdjacentHTML(
        "beforeend",
        "<td class=\"is-hidden-print has-text-right is-nowrap\">" +

        (locationObj.canUpdate ?
          "<a class=\"button is-small\" data-tooltip=\"Edit Location\" href=\"/locations/" + locationObj.locationID + "/edit\">" +
          "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span> <span>Edit</span>" +
          "</a>" :
          "") +

        (canDeleteLocation ?
          " <button class=\"button is-small is-danger is-delete-location-button\" data-tooltip=\"Delete Location\" data-location-index=\"" + locationIndex + "\" type=\"button\">" +
          "<span class=\"icon\"><i class=\"fas fa-trash\" aria-hidden=\"true\"></i></span>" +
          "</button>" :
          "") +

        "</td>"
      );

      if (canDeleteLocation) {

        trEle.getElementsByClassName("is-delete-location-button")[0].addEventListener("click", deleteLocationClickFn);

      }

    }

    return trEle;

  }


  function getLocations() {

    const currentLimit = parseInt(limitEle.value);
    const currentOffset = parseInt(offsetEle.value);

    displayedLocationList = [];

    searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading locations...</em>" +
      "</p>";

    cityssm.postJSON(
      "/locations/doGetLocations",
      formEle,
      function(locationResults) {

        displayedLocationList = locationResults.locations;

        if (displayedLocationList.length === 0) {

          searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "<strong>Your search returned no results.</strong><br />" +
            "Please try expanding your search criteria." +
            "</div>" +
            "</div>";

          return;

        }

        searchResultsEle.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">" +
          "<thead><tr>" +
          "<th>Location</th>" +
          "<th>Address</th>" +
          "<th class=\"has-text-centered\">Last Licence End Date</th>" +
          "<th class=\"has-text-centered\">Last Manufacturer End Date</th>" +
          "<th class=\"has-text-centered\">Last Distributor End Date</th>" +
          (canCreate ? "<th class=\"is-hidden-print\"><span class=\"sr-only\">Options</span></th>" : "") +
          "</tr></thead>" +
          "<tbody></tbody>" +
          "</table>";

        const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];

        for (let locationIndex = 0; locationIndex < displayedLocationList.length; locationIndex += 1) {

          const locationTrEle = renderLocationTrEle(displayedLocationList[locationIndex], locationIndex);
          tbodyEle.insertAdjacentElement("beforeend", locationTrEle);

        }

        searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
          "<div class=\"level-left has-text-weight-bold\">" +
          "Displaying locations " +
          (currentOffset + 1) +
          " to " +
          Math.min(currentLimit + currentOffset, locationResults.count) +
          " of " +
          locationResults.count +
          "</div>" +
          "</div>");

        if (currentLimit < locationResults.count) {

          const paginationEle = document.createElement("nav");
          paginationEle.className = "level-right is-hidden-print";
          paginationEle.setAttribute("role", "pagination");
          paginationEle.setAttribute("aria-label", "pagination");

          if (currentOffset > 0) {

            const previousEle = document.createElement("a");
            previousEle.className = "button";
            previousEle.innerText = "Previous";
            previousEle.addEventListener("click", function(clickEvent) {

              clickEvent.preventDefault();
              offsetEle.value = Math.max(0, currentOffset - currentLimit).toString();
              getLocations();

            });

            paginationEle.insertAdjacentElement("beforeend", previousEle);

          }

          if (currentLimit + currentOffset < locationResults.count) {

            const nextEle = document.createElement("a");
            nextEle.className = "button ml-3";
            nextEle.innerHTML = "<span>Next Locations</span><span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
            nextEle.addEventListener("click", function(clickEvent) {

              clickEvent.preventDefault();
              offsetEle.value = (currentOffset + currentLimit).toString();
              getLocations();

            });

            paginationEle.insertAdjacentElement("beforeend", nextEle);

          }

          searchResultsEle.getElementsByClassName("level")[0].insertAdjacentElement("beforeend", paginationEle);

        }

      }
    );

  }


  function resetOffsetAndGetLocations() {

    offsetEle.value = "0";
    getLocations();

  }


  function deleteLocationClickFn (clickEvent: Event) {

    clickEvent.preventDefault();

    const locationIndex = parseInt((<HTMLButtonElement>clickEvent.currentTarget).getAttribute("data-location-index"));
    const locationObj = displayedLocationList[locationIndex];

    const deleteFn = function() {

      cityssm.postJSON(
        "/locations/doDelete", {
          locationID: locationObj.locationID
        },
        function(responseJSON) {

          if (responseJSON.success) {

            getLocations();

          }

        }
      );

    };


    cityssm.confirmModal(
      "Delete Location",
      `Are you sure you want to delete ${cityssm.escapeHTML(locationObj.locationDisplayName)}?`,
      "Yes, Delete",
      "warning",
      deleteFn
    );

  }


  formEle.addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

  });


  document.getElementById("filter--locationNameAddress").addEventListener("change", resetOffsetAndGetLocations);
  document.getElementById("filter--locationIsDistributor").addEventListener("change", resetOffsetAndGetLocations);
  document.getElementById("filter--locationIsManufacturer").addEventListener("change", resetOffsetAndGetLocations);


  resetOffsetAndGetLocations();

}());
