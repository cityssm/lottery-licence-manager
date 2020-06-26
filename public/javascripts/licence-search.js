"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const licenceType_keyToName = {};
    const formEle = document.getElementById("form--filters");
    const limitEle = document.getElementById("filter--limit");
    const offsetEle = document.getElementById("filter--offset");
    const searchResultsEle = document.getElementById("container--searchResults");
    const externalLicenceNumberLabel = searchResultsEle.getAttribute("data-external-licence-number-label");
    const doLicenceSearchFn = () => {
        const currentLimit = parseInt(limitEle.value, 10);
        const currentOffset = parseInt(offsetEle.value, 10);
        searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading licences...</em>" +
            "</p>";
        cityssm.postJSON("/licences/doSearch", formEle, (licenceResults) => {
            const licenceList = licenceResults.licences;
            if (licenceList.length === 0) {
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
                "<th>" + externalLicenceNumberLabel + "</th>" +
                "<th>Licence</th>" +
                "<th>Organization Name</th>" +
                "<th>Location</th>" +
                "<th>Active Date Range</th>" +
                "<th class=\"is-hidden-print\"><span class=\"sr-only\">Options</span></th>" +
                "</tr></thead>" +
                "<tbody></tbody>" +
                "</table>";
            const tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];
            for (const licenceObj of licenceList) {
                const licenceType = licenceType_keyToName[licenceObj.licenceTypeKey];
                const trEle = document.createElement("tr");
                trEle.innerHTML =
                    "<td>" +
                        "<a data-tooltip=\"View Licence\" href=\"/licences/" + licenceObj.licenceID + "\">" +
                        cityssm.escapeHTML(licenceObj.externalLicenceNumber) + "<br />" +
                        "<small>Licence #" + licenceObj.licenceID + "</small>" +
                        "</a>" +
                        "</td>" +
                        "<td>" + (licenceType || licenceObj.licenceTypeKey) + "<br />" +
                        "<small>" + cityssm.escapeHTML(licenceObj.licenceDetails) + "</small>" +
                        "</td>" +
                        ("<td>" +
                            "<a data-tooltip=\"View Organization\" href=\"/organizations/" + licenceObj.organizationID + "\">" +
                            cityssm.escapeHTML(licenceObj.organizationName) +
                            "</a>" +
                            "</td>") +
                        ("<td>" +
                            "<a data-tooltip=\"View Location\" href=\"/locations/" + licenceObj.locationID + "\">" +
                            cityssm.escapeHTML(licenceObj.locationDisplayName) +
                            "</a>" +
                            (licenceObj.locationDisplayName === licenceObj.locationAddress1 ?
                                "" :
                                "<br /><small>" + cityssm.escapeHTML(licenceObj.locationAddress1) + "</small>") +
                            "</td>") +
                        ("<td class=\"is-nowrap\">" +
                            "<span class=\"has-cursor-default has-tooltip-right\" data-tooltip=\"Start Date\">" +
                            "<i class=\"fas fa-fw fa-play\" aria-hidden=\"true\"></i> " + licenceObj.startDateString +
                            "</span><br />" +
                            "<span class=\"has-cursor-default has-tooltip-right\" data-tooltip=\"End Date\">" +
                            "<i class=\"fas fa-fw fa-stop\" aria-hidden=\"true\"></i> " + licenceObj.endDateString +
                            "</span>" +
                            "</td>") +
                        "<td class=\"has-text-right is-nowrap is-hidden-print\">" +
                        (licenceObj.canUpdate ?
                            "<a class=\"button is-small\" data-tooltip=\"Edit Licence\"" +
                                " href=\"/licences/" + licenceObj.licenceID + "/edit\">" +
                                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                                "<span>Edit</span>" +
                                "</a> " : "") +
                        (licenceObj.issueDate ?
                            "<a class=\"button is-small\" data-tooltip=\"Print Licence\"" +
                                " href=\"/licences/" + licenceObj.licenceID + "/print\" download>" +
                                "<i class=\"fas fa-print\" aria-hidden=\"true\"></i>" +
                                "<span class=\"sr-only\">Print</span>" +
                                "</a>" :
                            "<span class=\"tag is-warning\">Not Issued</span>") +
                        "</div>" +
                        "</td>";
                tbodyEle.insertAdjacentElement("beforeend", trEle);
            }
            searchResultsEle.insertAdjacentHTML("beforeend", "<div class=\"level is-block-print\">" +
                "<div class=\"level-left has-text-weight-bold\">" +
                "Displaying licences " +
                (currentOffset + 1) +
                " to " +
                Math.min(currentLimit + currentOffset, licenceResults.count) +
                " of " +
                licenceResults.count +
                "</div>" +
                "</div>");
            if (currentLimit < licenceResults.count) {
                const paginationEle = document.createElement("nav");
                paginationEle.className = "level-right is-hidden-print";
                paginationEle.setAttribute("role", "pagination");
                paginationEle.setAttribute("aria-label", "pagination");
                if (currentOffset > 0) {
                    const previousEle = document.createElement("a");
                    previousEle.className = "button";
                    previousEle.innerText = "Previous";
                    previousEle.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        offsetEle.value = Math.max(0, currentOffset - currentLimit).toString();
                        doLicenceSearchFn();
                    });
                    paginationEle.insertAdjacentElement("beforeend", previousEle);
                }
                if (currentLimit + currentOffset < licenceResults.count) {
                    const nextEle = document.createElement("a");
                    nextEle.className = "button ml-3";
                    nextEle.innerHTML =
                        "<span>Next Licences</span>" +
                            "<span class=\"icon\"><i class=\"fas fa-chevron-right\" aria-hidden=\"true\"></i></span>";
                    nextEle.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        offsetEle.value = (currentOffset + currentLimit).toString();
                        doLicenceSearchFn();
                    });
                    paginationEle.insertAdjacentElement("beforeend", nextEle);
                }
                searchResultsEle.getElementsByClassName("level")[0].insertAdjacentElement("beforeend", paginationEle);
            }
        });
    };
    const resetOffsetAndDoLicenceSearchFn = () => {
        offsetEle.value = "0";
        doLicenceSearchFn();
    };
    const licenceTypeOptionEles = document.getElementById("filter--licenceTypeKey").getElementsByTagName("option");
    for (let optionIndex = 1; optionIndex < licenceTypeOptionEles.length; optionIndex += 1) {
        const optionEle = licenceTypeOptionEles[optionIndex];
        licenceType_keyToName[optionEle.value] = optionEle.innerText;
    }
    formEle.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
    });
    const inputEles = formEle.querySelectorAll(".input, .select select");
    for (const inputEle of inputEles) {
        inputEle.addEventListener("change", resetOffsetAndDoLicenceSearchFn);
    }
    resetOffsetAndDoLicenceSearchFn();
})();
