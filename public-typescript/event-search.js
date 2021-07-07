"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");
    const filterExternalLicenceNumberElement = document.querySelector("#filter--externalLicenceNumber");
    const filterLicenceTypeKeyElement = document.querySelector("#filter--licenceTypeKey");
    const filterOrganizationNameElement = document.querySelector("#filter--organizationName");
    const filterLocationNameElement = document.querySelector("#filter--locationName");
    const filterYearElement = document.querySelector("#filter--year");
    const resultsElement = document.querySelector("#container--events");
    const getEventsFunction = () => {
        resultsElement.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading events..." +
            "</p>";
        cityssm.postJSON(urlPrefix + "/events/doSearch", {
            externalLicenceNumber: filterExternalLicenceNumberElement.value,
            licenceTypeKey: filterLicenceTypeKeyElement.value,
            organizationName: filterOrganizationNameElement.value,
            locationName: filterLocationNameElement.value,
            eventYear: filterYearElement.value
        }, (eventList) => {
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
                const licenceType = exports.config_licenceTypes[eventObject.licenceTypeKey] || eventObject.licenceTypeKey;
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
            tableElement.className = "table is-fullwidth is-striped is-hoverable";
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
        });
    };
    filterExternalLicenceNumberElement.addEventListener("change", getEventsFunction);
    filterLicenceTypeKeyElement.addEventListener("change", getEventsFunction);
    filterOrganizationNameElement.addEventListener("change", getEventsFunction);
    filterLocationNameElement.addEventListener("change", getEventsFunction);
    filterYearElement.addEventListener("change", getEventsFunction);
    getEventsFunction();
})();
