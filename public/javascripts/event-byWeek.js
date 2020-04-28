"use strict";

(function() {

  const eventDateFilterEle = document.getElementById("filter--eventDate");
  const eventContainerEle = document.getElementById("container--events");

  const dayNames = llm.config_days;
  delete llm.config_days;

  const licenceTypes = llm.config_licenceTypes;
  delete llm.config_licenceTypes;

  function refreshEvents() {

    cityssm.clearElement(eventContainerEle);

    if (eventDateFilterEle.value === "") {

      eventDateFilterEle.value = cityssm.dateToString(new Date());

    }

    cityssm.postJSON("/events/doGetEventsByWeek", {
      eventDate: eventDateFilterEle.value
    }, function(responseJSON) {

      if (responseJSON.licences.length === 0 && responseJSON.events.length === 0) {

        eventContainerEle.innerHTML = "<div class=\"message is-info\">" +
          "<p class=\"message-body\">There are no licences or events with activity between " +
          responseJSON.startDateString + " and " + responseJSON.endDateString + "." +
          "</p>" +
          "</div>";

        return;

      }

      const tableEle = document.createElement("table");
      tableEle.className = "table is-fixed is-fullwidth";

      // Construct header

      let headerTheadHTML = "<thead><tr>";

      const headerDate = cityssm.dateStringToDate(responseJSON.startDateString);

      for (let weekDayIndex = 0; weekDayIndex <= 6; weekDayIndex += 1) {

        headerTheadHTML += "<th class=\"has-text-centered\">" +
          dayNames[weekDayIndex] + "<br />" +
          cityssm.dateToString(headerDate) +
          "</th>";

        headerDate.setDate(headerDate.getDate() + 1);

      }

      headerTheadHTML += "</tr></thead>";

      tableEle.innerHTML = headerTheadHTML;

      // Construct licences tbody

      const licenceTbodyEle = document.createElement("tbody");

      for (let licenceIndex = 0; licenceIndex < responseJSON.licences.length; licenceIndex += 1) {

        const licenceRecord = responseJSON.licences[licenceIndex];

        let fillerSize = 0;
        let leftSideFiller = "";

        if (licenceRecord.startDateString > responseJSON.startDateString) {

          fillerSize = cityssm.dateStringDifferenceInDays(responseJSON.startDateString, licenceRecord.startDateString);

          for (let fillerIndex = 0; fillerIndex < fillerSize; fillerIndex += 1) {

            leftSideFiller += "<td></td>";

          }

        }

        let licenceColspan = 1;

        if (licenceRecord.startDateString !== licenceRecord.endDateString) {

          licenceColspan = Math.min(
            7 - fillerSize,
            cityssm.dateStringDifferenceInDays(
              (fillerSize === 0 ? responseJSON.startDateString : licenceRecord.startDateString),
              licenceRecord.endDateString
            ) + 1
          );

        }

        let rightSideFiller = "";

        for (let fillerIndex = fillerSize + licenceColspan; fillerIndex < 7; fillerIndex += 1) {

          rightSideFiller += "<td></td>";

        }

        const licenceType = licenceTypes[licenceRecord.licenceTypeKey];

        licenceTbodyEle.insertAdjacentHTML("beforeend", "<tr>" +
          leftSideFiller +
          "<td colspan=\"" + licenceColspan + "\">" +
          "<a class=\"button has-text-left is-small is-block has-height-auto is-wrap is-link is-light\"" +
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

      // Construct events tbody

      eventContainerEle.appendChild(tableEle);

    });

  }

  eventDateFilterEle.addEventListener("change", refreshEvents);

  refreshEvents();

}());
