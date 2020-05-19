"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var currentDateString = cityssm.dateToString(new Date());
    var eventDateFilterEle = document.getElementById("filter--eventDate");
    var showLicencesCheckboxEle = document.getElementById("filter--showLicences");
    var eventContainerEle = document.getElementById("container--events");
    var dayNames = exports.config_days;
    delete exports.config_days;
    var licenceTypes = exports.config_licenceTypes;
    delete exports.config_licenceTypes;
    function refreshEvents() {
        cityssm.clearElement(eventContainerEle);
        if (eventDateFilterEle.value === "") {
            eventDateFilterEle.value = cityssm.dateToString(new Date());
        }
        cityssm.postJSON("/events/doGetEventsByWeek", {
            eventDate: eventDateFilterEle.value
        }, function (responseJSON) {
            if (responseJSON.licences.length === 0 && responseJSON.events.length === 0) {
                eventContainerEle.innerHTML = "<div class=\"message is-info\">" +
                    "<p class=\"message-body\">There are no licences or events with activity between " +
                    responseJSON.startDateString + " and " + responseJSON.endDateString + "." +
                    "</p>" +
                    "</div>";
                return;
            }
            var tableEle = document.createElement("table");
            tableEle.className = "table is-fixed is-fullwidth is-bordered";
            var headerTheadHTML = "<thead><tr>";
            var headerDate = cityssm.dateStringToDate(responseJSON.startDateString);
            for (var weekDayIndex = 0; weekDayIndex <= 6; weekDayIndex += 1) {
                var headerDateString = cityssm.dateToString(headerDate);
                headerTheadHTML += "<th class=\"has-text-centered" +
                    (headerDateString === currentDateString ?
                        " has-background-primary has-text-white" :
                        " has-background-white-ter") + "\">" +
                    dayNames[weekDayIndex] + "<br />" +
                    headerDateString +
                    "</th>";
                headerDate.setDate(headerDate.getDate() + 1);
            }
            headerTheadHTML += "</tr></thead>";
            tableEle.innerHTML = headerTheadHTML;
            var licenceTbodyEle = document.createElement("tbody");
            licenceTbodyEle.id = "tbody--licences";
            if (!showLicencesCheckboxEle.checked) {
                licenceTbodyEle.className = "is-hidden";
            }
            for (var licenceIndex = 0; licenceIndex < responseJSON.licences.length; licenceIndex += 1) {
                var licenceRecord = responseJSON.licences[licenceIndex];
                var fillerSize = 0;
                var leftSideFiller = "";
                if (licenceRecord.startDateString > responseJSON.startDateString) {
                    fillerSize = cityssm.dateStringDifferenceInDays(responseJSON.startDateString, licenceRecord.startDateString);
                    for (var fillerIndex = 0; fillerIndex < fillerSize; fillerIndex += 1) {
                        leftSideFiller += "<td></td>";
                    }
                }
                var licenceColspan = 1;
                if (licenceRecord.startDateString !== licenceRecord.endDateString) {
                    licenceColspan = Math.min(7 - fillerSize, cityssm.dateStringDifferenceInDays((fillerSize === 0 ? responseJSON.startDateString : licenceRecord.startDateString), licenceRecord.endDateString) + 1);
                }
                var rightSideFiller = "";
                for (var fillerIndex = fillerSize + licenceColspan; fillerIndex < 7; fillerIndex += 1) {
                    rightSideFiller += "<td></td>";
                }
                var licenceType = licenceTypes[licenceRecord.licenceTypeKey];
                licenceTbodyEle.insertAdjacentHTML("beforeend", "<tr>" +
                    leftSideFiller +
                    "<td colspan=\"" + licenceColspan + "\">" +
                    "<a class=\"button has-text-left is-small is-block has-height-auto is-wrap is-primary is-light\"" +
                    " data-tooltip=\"View Licence\"" +
                    " href=\"/licences/" + licenceRecord.licenceID + "\">" +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-certificate\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5 has-text-weight-semibold\">" +
                        licenceRecord.externalLicenceNumber + "<br />" +
                        (licenceType ? licenceType : licenceRecord.licenceTypeKey) +
                        "</div>" +
                        "</div>") +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5\">" +
                        (licenceRecord.locationName === "" ? licenceRecord.locationAddress1 : licenceRecord.locationName) +
                        "</div>" +
                        "</div>") +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-users\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5\">" +
                        licenceRecord.organizationName +
                        "</div>" +
                        "</div>") +
                    ("<div class=\"columns is-variable is-1\">" +
                        "<div class=\"column is-narrow\">" +
                        "<i class=\"fas fa-fw fa-calendar\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column\">" +
                        licenceRecord.startDateString +
                        (licenceRecord.startDateString === licenceRecord.endDateString ?
                            "" :
                            " to " + licenceRecord.endDateString) +
                        "</div>" +
                        "</div>") +
                    "</a>" +
                    "</td>" +
                    rightSideFiller +
                    "</tr>");
            }
            tableEle.appendChild(licenceTbodyEle);
            var eventTdEles = [
                document.createElement("td"),
                document.createElement("td"),
                document.createElement("td"),
                document.createElement("td"),
                document.createElement("td"),
                document.createElement("td"),
                document.createElement("td")
            ];
            for (var eventIndex = 0; eventIndex < responseJSON.events.length; eventIndex += 1) {
                var eventRecord = responseJSON.events[eventIndex];
                var licenceType = licenceTypes[eventRecord.licenceTypeKey];
                var tdIndex = cityssm.dateStringToDate(eventRecord.eventDateString).getDay();
                eventTdEles[tdIndex].insertAdjacentHTML("beforeend", "<a class=\"button has-margin-bottom-5 has-text-left is-small is-block has-height-auto is-wrap is-link is-light\"" +
                    " data-tooltip=\"View Event\"" +
                    " href=\"/events/" + eventRecord.licenceID + "/" + eventRecord.eventDate + "\">" +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-clock\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5\">" +
                        eventRecord.startTimeString +
                        "</div>" +
                        "</div>") +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-certificate\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5 has-text-weight-semibold\">" +
                        eventRecord.externalLicenceNumber + "<br />" +
                        (licenceType ? licenceType : eventRecord.licenceTypeKey) +
                        "</div>" +
                        "</div>") +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5\">" +
                        (eventRecord.locationName === "" ? eventRecord.locationAddress1 : eventRecord.locationName) +
                        "</div>" +
                        "</div>") +
                    ("<div class=\"columns has-margin-bottom-0 is-variable is-1\">" +
                        "<div class=\"column has-padding-bottom-5 is-narrow\">" +
                        "<i class=\"fas fa-fw fa-users\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column has-padding-bottom-5\">" +
                        eventRecord.organizationName +
                        "</div>" +
                        "</div>") +
                    "</a>");
            }
            var eventTrEle = document.createElement("tr");
            for (var tdIndex = 0; tdIndex < eventTdEles.length; tdIndex += 1) {
                eventTrEle.appendChild(eventTdEles[tdIndex]);
            }
            var eventTbodyEle = document.createElement("tbody");
            eventTbodyEle.appendChild(eventTrEle);
            tableEle.appendChild(eventTbodyEle);
            eventContainerEle.appendChild(tableEle);
        });
    }
    eventDateFilterEle.addEventListener("change", refreshEvents);
    refreshEvents();
    showLicencesCheckboxEle.addEventListener("change", function () {
        if (showLicencesCheckboxEle.checked) {
            document.getElementById("tbody--licences").classList.remove("is-hidden");
        }
        else {
            document.getElementById("tbody--licences").classList.add("is-hidden");
        }
    });
}());
