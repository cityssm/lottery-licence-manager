import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const currentDateString = cityssm.dateToString(new Date());

  const eventDateFilterEle = <HTMLInputElement>document.getElementById("filter--eventDate");
  const showLicencesCheckboxEle = <HTMLInputElement>document.getElementById("filter--showLicences");
  const eventContainerEle = document.getElementById("container--events");

  const dayNames = exports.config_days;
  delete exports.config_days;

  const licenceTypes = exports.config_licenceTypes;
  delete exports.config_licenceTypes;

  const refreshEventsFn = () => {

    cityssm.clearElement(eventContainerEle);

    if (eventDateFilterEle.value === "") {
      eventDateFilterEle.value = cityssm.dateToString(new Date());
    }

    cityssm.postJSON("/events/doGetEventsByWeek", {
      eventDate: eventDateFilterEle.value
    },
      (responseJSON: {
        startDateString: string, endDateString: string,
        licences: {
          licenceID: number,
          externalLicenceNumber: string,
          organizationName: string,
          locationName: string,
          locationAddress1: string,
          licenceTypeKey: string,
          startDateString: string,
          endDateString: string
        }[],
        events: {
          licenceID: number,
          eventDate: number,
          eventDateString: string,
          externalLicenceNumber: string,
          organizationName: string,
          locationName: string,
          locationAddress1: string,
          licenceTypeKey: string,
          startTimeString: string
        }[]
      }) => {

        if (responseJSON.licences.length === 0 && responseJSON.events.length === 0) {

          eventContainerEle.innerHTML = "<div class=\"message is-info\">" +
            "<p class=\"message-body\">There are no licences or events with activity between " +
            responseJSON.startDateString + " and " + responseJSON.endDateString + "." +
            "</p>" +
            "</div>";

          return;

        }

        const tableEle = document.createElement("table");
        tableEle.className = "table is-fixed is-fullwidth is-bordered";

        // Construct header

        let headerTheadHTML = "<thead><tr>";

        const headerDate = cityssm.dateStringToDate(responseJSON.startDateString);

        for (let weekDayIndex = 0; weekDayIndex <= 6; weekDayIndex += 1) {

          const headerDateString = cityssm.dateToString(headerDate);

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

        // Construct licences tbody

        const licenceTbodyEle = document.createElement("tbody");
        licenceTbodyEle.id = "tbody--licences";

        if (!showLicencesCheckboxEle.checked) {

          licenceTbodyEle.className = "is-hidden";

        }

        for (const licenceRecord of responseJSON.licences) {

          let fillerSize = 0;
          let leftSideFiller = "";

          if (licenceRecord.startDateString > responseJSON.startDateString) {

            fillerSize =
              cityssm.dateStringDifferenceInDays(responseJSON.startDateString, licenceRecord.startDateString);

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
            "<a class=\"button has-text-left is-small is-block has-height-auto is-wrap is-primary is-light\"" +
            " data-tooltip=\"View Licence\"" +
            " href=\"/licences/" + licenceRecord.licenceID + "\">" +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-certificate\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2 has-text-weight-semibold\">" +
              licenceRecord.externalLicenceNumber + "<br />" +
              (licenceType ? licenceType : licenceRecord.licenceTypeKey) +
              "</div>" +
              "</div>") +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2\">" +
              (licenceRecord.locationName === "" ? licenceRecord.locationAddress1 : licenceRecord.locationName) +
              "</div>" +
              "</div>") +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-users\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2\">" +
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

        const eventTdEles = [
          document.createElement("td"),
          document.createElement("td"),
          document.createElement("td"),
          document.createElement("td"),
          document.createElement("td"),
          document.createElement("td"),
          document.createElement("td")
        ];

        for (const eventRecord of responseJSON.events) {

          const licenceType = licenceTypes[eventRecord.licenceTypeKey];

          const tdIndex = cityssm.dateStringToDate(eventRecord.eventDateString).getDay();

          eventTdEles[tdIndex].insertAdjacentHTML(
            "beforeend",
            "<a class=\"button mb-2 has-text-left is-small is-block has-height-auto is-wrap is-link is-light\"" +
            " data-tooltip=\"View Event\"" +
            " href=\"/events/" + eventRecord.licenceID + "/" + eventRecord.eventDate + "\">" +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-clock\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2\">" +
              eventRecord.startTimeString +
              "</div>" +
              "</div>") +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-certificate\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2 has-text-weight-semibold\">" +
              eventRecord.externalLicenceNumber + "<br />" +
              (licenceType ? licenceType : eventRecord.licenceTypeKey) +
              "</div>" +
              "</div>") +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2\">" +
              (eventRecord.locationName === "" ? eventRecord.locationAddress1 : eventRecord.locationName) +
              "</div>" +
              "</div>") +

            ("<div class=\"columns mb-0 is-variable is-1\">" +
              "<div class=\"column pb-2 is-narrow\">" +
              "<i class=\"fas fa-fw fa-users\" aria-hidden=\"true\"></i>" +
              "</div>" +
              "<div class=\"column pb-2\">" +
              eventRecord.organizationName +
              "</div>" +
              "</div>") +

            "</a>"
          );

        }

        const eventTrEle = document.createElement("tr");

        for (const eventTdEle of eventTdEles) {
          eventTrEle.appendChild(eventTdEle);
        }

        const eventTbodyEle = document.createElement("tbody");
        eventTbodyEle.appendChild(eventTrEle);

        tableEle.appendChild(eventTbodyEle);

        // Display table

        eventContainerEle.appendChild(tableEle);
      });
  };

  eventDateFilterEle.addEventListener("change", refreshEventsFn);

  refreshEventsFn();

  showLicencesCheckboxEle.addEventListener("change", () => {

    if (showLicencesCheckboxEle.checked) {
      document.getElementById("tbody--licences").classList.remove("is-hidden");
    } else {
      document.getElementById("tbody--licences").classList.add("is-hidden");
    }
  });
})();
