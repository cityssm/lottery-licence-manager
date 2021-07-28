"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const dateDiff = exports.dateDiff;
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    const formElement = document.querySelector("#form--searchFilters");
    const limitElement = document.querySelector("#filter--limit");
    const offsetElement = document.querySelector("#filter--offset");
    const searchResultsElement = document.querySelector("#container--searchResults");
    const canCreate = document.querySelector("main").dataset.canCreate === "true";
    let nowDate = new Date();
    let displayedLocationList = [];
    const renderLocationTrElementFunction = (locationObject, locationIndex) => {
        const trElement = document.createElement("tr");
        trElement.innerHTML = "<td></td>";
        const locationDisplayNameLinkElement = document.createElement("a");
        locationDisplayNameLinkElement.textContent = locationObject.locationDisplayName;
        locationDisplayNameLinkElement.href = urlPrefix + "/locations/" + locationObject.locationID.toString();
        trElement.querySelector("td").append(locationDisplayNameLinkElement);
        const addressTdElement = document.createElement("td");
        addressTdElement.innerHTML =
            (locationObject.locationAddress1 === ""
                ? ""
                : cityssm.escapeHTML(locationObject.locationAddress1) + "<br />") +
                (locationObject.locationAddress2 === ""
                    ? ""
                    : "<small>" + cityssm.escapeHTML(locationObject.locationAddress2) + "</small><br />") +
                (locationObject.locationCity === ""
                    ? ""
                    : "<small>" + cityssm.escapeHTML(locationObject.locationCity) + ", " + locationObject.locationProvince + "</small>");
        trElement.append(addressTdElement);
        let timeAgoHTML = "";
        if (locationObject.licences_endDateMaxString !== "") {
            const endDate = cityssm.dateStringToDate(locationObject.licences_endDateMaxString);
            if (endDate < nowDate) {
                timeAgoHTML = "<br />" +
                    "<span class=\"is-size-7\">" + dateDiff(endDate, nowDate).formatted + " ago</span>";
            }
        }
        trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (locationObject.licences_endDateMaxString === ""
                ? "<span class=\"has-text-grey\">Not Used</span>"
                : locationObject.licences_endDateMaxString + timeAgoHTML) +
            "</td>");
        trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (locationObject.locationIsManufacturer
                ? "<span data-tooltip=\"Manufacturer\">" +
                    "<span class=\"tag is-success\">Yes</span><br />" +
                    (locationObject.manufacturer_endDateMaxString === ""
                        ? "<span class=\"has-text-grey\">Never Used</span>"
                        : locationObject.manufacturer_endDateMaxString) +
                    "</span>"
                : "<span class=\"sr-only\">No</span>") +
            "</td>");
        trElement.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
            (locationObject.locationIsDistributor
                ? "<span data-tooltip=\"Distributor\">" +
                    "<span class=\"tag is-success\">Yes</span><br />" +
                    (locationObject.distributor_endDateMaxString === ""
                        ? "<span class=\"has-text-grey\">Never Used</span>"
                        : locationObject.distributor_endDateMaxString) +
                    "</span>"
                : "<span class=\"sr-only\">No</span>") +
            "</td>");
        if (canCreate) {
            const canDeleteLocation = locationObject.canUpdate && locationObject.licences_count === 0 &&
                locationObject.distributor_count === 0 && locationObject.manufacturer_count === 0;
            trElement.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print has-text-right is-nowrap\">" +
                (locationObject.canUpdate
                    ? "<a class=\"button is-small\" data-tooltip=\"Edit Location\"" +
                        " href=\"/locations/" + locationObject.locationID.toString() + "/edit\">" +
                        "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span> <span>Edit</span>" +
                        "</a>"
                    : "") +
                (canDeleteLocation
                    ? " <button class=\"button is-small is-danger is-delete-location-button\"" +
                        " data-tooltip=\"Delete Location\"" +
                        " data-location-index=\"" + locationIndex.toString() + "\" type=\"button\">" +
                        "<span class=\"icon\"><i class=\"fas fa-trash\" aria-hidden=\"true\"></i></span>" +
                        "</button>"
                    : "") +
                "</td>");
            if (canDeleteLocation) {
                trElement.querySelector(".is-delete-location-button").addEventListener("click", deleteLocationClickFunction);
            }
        }
        return trElement;
    };
    const getLocationsFunction = () => {
        const currentLimit = Number.parseInt(limitElement.value, 10);
        const currentOffset = Number.parseInt(offsetElement.value, 10);
        displayedLocationList = [];
        searchResultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading locations...</em>" +
            "</p>";
        cityssm.postJSON(urlPrefix + "/locations/doGetLocations", formElement, (locationResults) => {
            displayedLocationList = locationResults.locations;
            if (displayedLocationList.length === 0) {
                searchResultsElement.innerHTML = "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">" +
                    "<strong>Your search returned no results.</strong><br />" +
                    "Please try expanding your search criteria." +
                    "</div>" +
                    "</div>";
                return;
            }
            nowDate = new Date();
            searchResultsElement.innerHTML = "<table class=\"table is-fullwidth is-striped is-hoverable has-sticky-header\">" +
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
            const tbodyElement = searchResultsElement.querySelector("tbody");
            for (const [locationIndex, location] of displayedLocationList.entries()) {
                const locationTrElement = renderLocationTrElementFunction(location, locationIndex);
                tbodyElement.append(locationTrElement);
            }
            searchResultsElement.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
                "<div class=\"level-left has-text-weight-bold\">" +
                "Displaying locations " +
                (currentOffset + 1).toString() +
                " to " +
                Math.min(currentLimit + currentOffset, locationResults.count).toString() +
                " of " +
                locationResults.count.toString() +
                "</div>" +
                "</div>");
            if (currentLimit < locationResults.count) {
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
                        getLocationsFunction();
                    });
                    paginationElement.append(previousElement);
                }
                if (currentLimit + currentOffset < locationResults.count) {
                    const nextElement = document.createElement("a");
                    nextElement.className = "button ml-3";
                    nextElement.innerHTML = "<span>Next Locations</span><span class=\"icon\">" +
                        "<i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i>" +
                        "</span>";
                    nextElement.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        offsetElement.value = (currentOffset + currentLimit).toString();
                        getLocationsFunction();
                    });
                    paginationElement.append(nextElement);
                }
                searchResultsElement.querySelector(".level").append(paginationElement);
            }
        });
    };
    const resetOffsetAndGetLocationsFunction = () => {
        offsetElement.value = "0";
        getLocationsFunction();
    };
    const deleteLocationClickFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const locationIndex = Number.parseInt(clickEvent.currentTarget.dataset.locationIndex, 10);
        const locationObject = displayedLocationList[locationIndex];
        const deleteFunction = () => {
            cityssm.postJSON(urlPrefix + "/locations/doDelete", {
                locationID: locationObject.locationID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    getLocationsFunction();
                }
            });
        };
        cityssm.confirmModal("Delete Location", `Are you sure you want to delete ${cityssm.escapeHTML(locationObject.locationDisplayName)}?`, "Yes, Delete", "warning", deleteFunction);
    };
    formElement.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
    });
    document.querySelector("#filter--locationNameAddress").addEventListener("change", resetOffsetAndGetLocationsFunction);
    document.querySelector("#filter--locationIsDistributor").addEventListener("change", resetOffsetAndGetLocationsFunction);
    document.querySelector("#filter--locationIsManufacturer").addEventListener("change", resetOffsetAndGetLocationsFunction);
    document.querySelector("#filter--locationIsActive").addEventListener("change", resetOffsetAndGetLocationsFunction);
    resetOffsetAndGetLocationsFunction();
})();
