/* global window, document */
/* global config_licenceTypes */


(function() {
  "use strict";

  const licenceTypes = window.llm.arrayToObject(config_licenceTypes, "licenceTypeKey");

  const filterMonthEle = document.getElementById("filter--month");
  const filterYearEle = document.getElementById("filter--year");

  const resultsEle = document.getElementById("container--events");

  const canEdit = resultsEle.getAttribute("data-can-edit") === "true";

  function getEvents() {

    resultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
      "<em>Loading events..." +
      "</p>";

    const yearValue = filterYearEle.value;
    const monthValue = filterMonthEle.value;
    const monthName = filterMonthEle.options[filterMonthEle.selectedIndex].text;

    window.fetch("/events/doSearch", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          year: yearValue,
          month: monthValue
        })
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(eventList) {

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
            const licenceTypeObj = licenceTypes[eventObj.LicenceTypeKey];

            const licenceType = licenceTypeObj ? licenceTypeObj.licenceType : eventObj.LicenceTypeKey;

            if (currentDate !== eventObj.EventDate) {

              if (currentDate !== 0) {
                resultsEle.insertAdjacentElement("beforeend", currentDateListEle);
              }

              currentDate = eventObj.EventDate;
              resultsEle.insertAdjacentHTML("beforeend", "<h2 class=\"title is-4\">" + eventObj.EventDateString + "</h2>");
              currentDateListEle = document.createElement("ul");
              currentDateListEle.className = "list";
            }

            currentDateListEle.insertAdjacentHTML("beforeend", "<li class=\"list-item\">" +
              "<div class=\"columns\">" +
              ("<div class=\"column\">" +
                "<a href=\"/events/" + eventObj.LicenceID + "/" + eventObj.EventDate + "\">" +
                window.llm.escapeHTML(eventObj.ExternalLicenceNumber) + "<br />" +
                "<small>Licence #" + eventObj.LicenceID + "</small>" +
                "</a>" +
                "</div>") +
              ("<div class=\"column\">" +
                window.llm.escapeHTML(eventObj.OrganizationName) +
                "</div>") +
              ("<div class=\"column\">" +
                licenceType + "<br />" +
                "<small>" + window.llm.escapeHTML(eventObj.LicenceDetails) + "</small>" +
                "</div>") +
              (canEdit ?
                "<div class=\"column is-narrow is-hidden-print\">" +
                "<a class=\"button\" href=\"/events/" + eventObj.LicenceID + "/" + eventObj.EventDate + "/edit\">" +
                "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
                "<span>Edit</span>" +
                "</a>" +
                "</div>" : "") +
              "</div>" +
              "</li>");
          }

          resultsEle.insertAdjacentElement("beforeend", currentDateListEle);
        }
      });
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



  getEvents();
}());
