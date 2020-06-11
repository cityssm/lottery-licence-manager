"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var formEle = document.getElementById("form--filters");
    var searchResultsEle = document.getElementById("container--searchResults");
    var canCreate = document.getElementsByTagName("main")[0].getAttribute("data-can-create") === "true";
    function doOrganizationSearch() {
        searchResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
            "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
            "<em>Loading organizations...</em>" +
            "</p>";
        cityssm.postJSON("/organizations/doSearch", formEle, function (organizationsList) {
            if (organizationsList.length === 0) {
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
                "<th colspan=\"2\">Organization Name</th>" +
                "<th>Default Representative</th>" +
                (canCreate ? "<th class=\"is-hidden-print\"><span class=\"sr-only\">Organization Options</span></th>" : "") +
                "<th>Licences</th>" +
                (canCreate ? "<th class=\"is-hidden-print\"><span class=\"sr-only\">Licence Options</span></th>" : "") +
                "</tr></thead>" +
                "<tbody></tbody>" +
                "</table>";
            var tbodyEle = searchResultsEle.getElementsByTagName("tbody")[0];
            for (var organizationIndex = 0; organizationIndex < organizationsList.length; organizationIndex += 1) {
                var organizationObj = organizationsList[organizationIndex];
                var trEle = document.createElement("tr");
                trEle.innerHTML = "<td></td>";
                var organizationNameLinkEle = document.createElement("a");
                if (!organizationObj.isEligibleForLicences) {
                    organizationNameLinkEle.className = "has-text-danger";
                    organizationNameLinkEle.setAttribute("data-tooltip", "Not Eligible for New Licences");
                }
                else {
                    organizationNameLinkEle.setAttribute("data-tooltip", "View Organization");
                }
                organizationNameLinkEle.innerText = organizationObj.organizationName;
                organizationNameLinkEle.href = "/organizations/" + organizationObj.organizationID;
                trEle.getElementsByTagName("td")[0].insertAdjacentElement("beforeend", organizationNameLinkEle);
                trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
                    (organizationObj.organizationNote === "" ?
                        "" :
                        "<span class=\"tag has-cursor-default is-info is-light\" data-tooltip=\"" + cityssm.escapeHTML(organizationObj.organizationNote.length > 30 ? organizationObj.organizationNote.substring(0, 27) + "..." : organizationObj.organizationNote) + "\">" +
                            "<i class=\"fas fa-sticky-note mr-2\" aria-hidden=\"true\"></i> Note" +
                            "</span>") +
                    "</td>");
                trEle.insertAdjacentHTML("beforeend", "<td>" +
                    (organizationObj.representativeName || "<span class=\"has-text-grey\">(No Representatives)</span>") +
                    "</td>");
                if (canCreate) {
                    trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
                        (organizationObj.canUpdate ?
                            "<a class=\"button is-small\" data-tooltip=\"Edit Organization\" href=\"/organizations/" + organizationObj.organizationID + "/edit\">" +
                                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                                "<span>Edit</span>" +
                                "</a>" :
                            "") +
                        "</td>");
                }
                var licenceHTML = "";
                if (organizationObj.licences_activeCount > 0) {
                    licenceHTML = "<span class=\"tag has-cursor-default is-info\" data-tooltip=\"Number of Active Licences\">" +
                        "<i class=\"fas fa-certificate mr-2\" aria-hidden=\"true\"></i> " + organizationObj.licences_activeCount +
                        "</span>";
                }
                else if (organizationObj.licences_endDateMax) {
                    licenceHTML = "<span class=\"tag has-cursor-default is-info is-light\" data-tooltip=\"Last Licence End Date\">" +
                        "<i class=\"fas fa-stop mr-2\" aria-hidden=\"true\"></i> " + organizationObj.licences_endDateMaxString +
                        "</span>";
                }
                trEle.insertAdjacentHTML("beforeend", "<td>" + licenceHTML + "</td>");
                if (canCreate) {
                    trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
                        (organizationObj.isEligibleForLicences ?
                            "<a class=\"button is-small\" data-tooltip=\"Create a New Licence\" href=\"/licences/new/" + organizationObj.organizationID + "\">" +
                                "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
                                "<span>New</span>" +
                                "</a>" : "") +
                        "</td>");
                }
                tbodyEle.insertAdjacentElement("beforeend", trEle);
            }
        });
    }
    formEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
    });
    var inputEles = formEle.querySelectorAll(".input, .select");
    for (var inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
        inputEles[inputIndex].addEventListener("change", doOrganizationSearch);
    }
    doOrganizationSearch();
}());
