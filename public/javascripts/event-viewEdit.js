"use strict";

(function() {

  // Switch dates nav

  const eventDateSelectEle = document.getElementById("eventNav--eventDate");

  if (eventDateSelectEle) {

    eventDateSelectEle.addEventListener("change", function(changeEvent) {

      const licenceID = changeEvent.currentTarget.getAttribute("data-licence-id");
      const newEventDate = changeEvent.currentTarget.value;
      const isEdit = changeEvent.currentTarget.getAttribute("data-is-edit") === "true";

      window.location.href = "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");

    });

  }

}());
