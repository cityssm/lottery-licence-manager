/* global window, document */


(function() {
  "use strict";

  const filterMonthEle = document.getElementById("filter--month");
  const filterYearEle = document.getElementById("filter--year");

  const resultsEle = document.getElementById("container--events");

  function getEvents() {

    resultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
      "<i class=\"fas fa-3x fa-circle-notch fa-spin\"></i><br />" +
      "<em>Loading events..." +
      "</p>";

      window.fetch("/events/doSearch", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            year: filterYearEle.value,
            month: filterMonthEle.value
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(eventList) {

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
