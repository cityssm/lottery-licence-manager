"use strict";

(function() {

  // Switch dates nav

  document.getElementById("eventNav--eventDate").addEventListener("change", function(changeEvent) {

    const licenceID = changeEvent.currentTarget.getAttribute("data-licence-id");
    const newEventDate = changeEvent.currentTarget.value;
    const isEdit = changeEvent.currentTarget.getAttribute("data-is-edit") === "true";

    window.location.href = "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");

  });

}());
