(function() {

  // Switch dates nav

  const eventDateSelectEle = <HTMLSelectElement>document.getElementById("eventNav--eventDate");

  if (eventDateSelectEle) {

    eventDateSelectEle.addEventListener("change", function() {

      const licenceID = eventDateSelectEle.getAttribute("data-licence-id");
      const newEventDate = eventDateSelectEle.value;
      const isEdit = eventDateSelectEle.getAttribute("data-is-edit") === "true";

      window.location.href = "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");

    });

  }

}());
