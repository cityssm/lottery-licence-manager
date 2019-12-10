/* global window, document */

(function() {
  "use strict";

  const licenceID = document.getElementById("event--licenceID").value;
  const eventDate = document.getElementById("event--eventDate").value;

  document.getElementById("eventNav--eventDate").addEventListener("change", function(changeEvent) {

    const newEventDate = changeEvent.currentTarget.value;

    window.location.href = "/events/" + licenceID + "/" + newEventDate + "/edit";
  });
}());
