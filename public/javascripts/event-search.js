"use strict";

(function() {

  const filterMonthEle = document.getElementById("filter--month");
  const filterYearEle = document.getElementById("filter--year");

  const resultsEle = document.getElementById("container--events");

  function getEvents() {

    resultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading events..." +
      "</p>";

    const yearValue = filterYearEle.value;
    const monthValue = filterMonthEle.value;
    const monthName = filterMonthEle.options[filterMonthEle.selectedIndex].text;

    cityssm.postJSON(
      "/events/doSearch", {
        year: yearValue,
        month: monthValue
      },
      function(eventList) {

        if (eventList.length === 0) {

          resultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "There are no lottery events scheduled in " + monthName + " " + yearValue + "." +
            "</div>" +
            "</div>";

        } else {

          resultsEle.innerHTML = "";

          let currentDate = 0;
          let currentDateListEle;

          for (let eventIndex = 0; eventIndex < eventList.length; eventIndex += 1) {

            const eventObj = eventList[eventIndex];

            const licenceType = llm.config_licenceTypes[eventObj.licenceTypeKey] || eventObj.licenceTypeKey;

            if (currentDate !== eventObj.eventDate) {

              if (currentDate !== 0) {

                resultsEle.insertAdjacentElement("beforeend", currentDateListEle);

              }

              currentDate = eventObj.eventDate;
              resultsEle.insertAdjacentHTML(
                "beforeend",
                "<h2 class=\"title is-4\">" + eventObj.eventDateString + "</h2>"
              );
              currentDateListEle = document.createElement("ul");
              currentDateListEle.className = "list";

            }

            const eventURL = "/events/" + eventObj.licenceID + "/" + eventObj.eventDate;

            currentDateListEle.insertAdjacentHTML("beforeend", "<li class=\"list-item\">" +
              "<div class=\"columns\">" +
              ("<div class=\"column is-1\">" +
                "<a href=\"" + eventURL + "\">" +
                cityssm.escapeHTML(eventObj.externalLicenceNumber) + "<br />" +
                "<small>Licence #" + eventObj.licenceID + "</small>" +
                "</a>" +
                "</div>") +
              ("<div class=\"column\">" +
                cityssm.escapeHTML(eventObj.organizationName) +
                "</div>") +
              ("<div class=\"column\">" +
                licenceType + "<br />" +
                "<small>" + cityssm.escapeHTML(eventObj.licenceDetails) + "</small>" +
                "</div>") +
              ("<div class=\"column\">" +
                cityssm.escapeHTML(eventObj.locationDisplayName) + "<br />" +
                "<small>" + eventObj.startTimeString +
                (eventObj.startTimeString === eventObj.endTimeString ? "" : " to " + eventObj.endTimeString) +
                "</small>" +
                "</div>") +
              "<div class=\"column is-1-desktop is-hidden-print has-text-right\">" +
              (eventObj.canUpdate ?
                "<a class=\"button is-small\" href=\"" + eventURL + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a>" : "") +
              "</div>" +
              "</div>" +
              "</li>");

          }

          resultsEle.insertAdjacentElement("beforeend", currentDateListEle);

        }

      }
    );

  }

  document.getElementById("filter--previous").addEventListener("click", function() {

    if (filterMonthEle.value === "1") {

      filterMonthEle.value = "12";
      filterYearEle.value = parseInt(filterYearEle.value) - 1;

    } else {

      filterMonthEle.value = parseInt(filterMonthEle.value) - 1;

    }

    getEvents();

  });

  document.getElementById("filter--next").addEventListener("click", function() {

    if (filterMonthEle.value === "12") {

      filterMonthEle.value = "1";
      filterYearEle.value = parseInt(filterYearEle.value) + 1;

    } else {

      filterMonthEle.value = parseInt(filterMonthEle.value) + 1;

    }

    getEvents();

  });

  filterMonthEle.addEventListener("change", getEvents);
  filterYearEle.addEventListener("change", getEvents);


  getEvents();

}());
