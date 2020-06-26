"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const inactiveYearsFilterEle = document.getElementById("filter--inactiveYears");
    const searchResultsEle = document.getElementById("container--searchResults");
    const confirmDeleteLocationFn = (clickEvent) => {
        const buttonEle = clickEvent.currentTarget;
        const locationDisplayName = cityssm.escapeHTML(buttonEle.getAttribute("data-location-display-name"));
        const deleteFn = () => {
            const locationID = buttonEle.getAttribute("data-location-id");
            cityssm.postJSON("/locations/doDelete", {
                locationID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    cityssm.alertModal(responseJSON.message, "", "OK", "success");
                    buttonEle.closest("tr").remove();
                }
                else {
                    cityssm.alertModal(responseJSON.message, "", "OK", "danger");
                }
            });
        };
        cityssm.confirmModal("Delete Location?", "Are you sure you want delete " + locationDisplayName + "?", "Yes, Delete", "danger", deleteFn);
    };
    const getInactiveLocationsFn = () => {
        searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading locations...</em>" +
            "</p>";
        cityssm.postJSON("/locations/doGetInactive", {
            inactiveYears: inactiveYearsFilterEle.value
        }, (inactiveList) => {
            if (inactiveList.length === 0) {
                searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
                    "<p class=\"message-body\">" +
                    "There are no inactive locations to report." +
                    "</p>" +
                    "</div>";
                return;
            }
            const tableEle = document.createElement("table");
            tableEle.className = "table is-fullwidth is-striped is-hoverable";
            tableEle.innerHTML = "<thead>" +
                "<tr>" +
                "<th>Location</th>" +
                "<th class=\"has-text-centered\">Last Licence End Date</th>" +
                "<th class=\"has-text-centered\">Last Updated</th>" +
                "<th><span class=\"sr-only\">Delete</span></th>" +
                "</tr>" +
                "</thead>";
            const tbodyEle = document.createElement("tbody");
            for (const locationObj of inactiveList) {
                const trEle = document.createElement("tr");
                const safeLocationDisplayName = cityssm.escapeHTML(locationObj.locationDisplayName);
                trEle.insertAdjacentHTML("beforeend", "<td>" +
                    "<a data-tooltip=\"View Location\"" +
                    " href=\"/locations/" + locationObj.locationID + "\">" +
                    safeLocationDisplayName +
                    "</a>" +
                    (locationObj.locationDisplayName === locationObj.locationAddress1 ? "" : "<br />" +
                        "<small>" + cityssm.escapeHTML(locationObj.locationAddress1) + "</small>") +
                    "</td>");
                let dateMax = locationObj.licences_endDateMax;
                let dateMaxString = locationObj.licences_endDateMaxString;
                let dateTag = "Licence Location";
                if (locationObj.distributor_endDateMax && (!dateMax || dateMax < locationObj.distributor_endDateMax)) {
                    dateMax = locationObj.distributor_endDateMax;
                    dateMaxString = locationObj.distributor_endDateMaxString;
                    dateTag = "Distributor";
                }
                if (locationObj.manufacturer_endDateMax && (!dateMax || dateMax < locationObj.manufacturer_endDateMax)) {
                    dateMax = locationObj.manufacturer_endDateMax;
                    dateMaxString = locationObj.manufacturer_endDateMaxString;
                    dateTag = "Manufacturer";
                }
                trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
                    (dateMax ?
                        dateMaxString + "<br /><span class=\"tag is-light is-info\">" + dateTag + "</span>" :
                        "<span class=\"tag is-light is-danger\">No Licences</span>") +
                    "</td>");
                trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-centered\">" +
                    "<span data-tooltip=\"Updated by " + locationObj.recordUpdate_userName + "\">" +
                    locationObj.recordUpdate_dateString +
                    "</span>" +
                    "</td>");
                trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
                    "<button class=\"button is-small is-danger\"" +
                    " data-tooltip=\"Delete Location\"" +
                    " data-location-id=\"" + locationObj.locationID + "\"" +
                    " data-location-display-name=\"" + safeLocationDisplayName + "\" type=\"button\">" +
                    "<span class=\"icon\"><i class=\"fas fa-trash\" aria-hidden=\"true\"></i></span> <span>Delete</span>" +
                    "</button>" +
                    "</td>");
                trEle.getElementsByTagName("button")[0].addEventListener("click", confirmDeleteLocationFn);
                tbodyEle.insertAdjacentElement("beforeend", trEle);
            }
            tableEle.insertAdjacentElement("beforeend", tbodyEle);
            cityssm.clearElement(searchResultsEle);
            searchResultsEle.insertAdjacentElement("beforeend", tableEle);
        });
    };
    inactiveYearsFilterEle.addEventListener("change", getInactiveLocationsFn);
    getInactiveLocationsFn();
})();
