(function () {
    var eventDateSelectEle = document.getElementById("eventNav--eventDate");
    if (eventDateSelectEle) {
        eventDateSelectEle.addEventListener("change", function () {
            var licenceID = eventDateSelectEle.getAttribute("data-licence-id");
            var newEventDate = eventDateSelectEle.value;
            var isEdit = eventDateSelectEle.getAttribute("data-is-edit") === "true";
            window.location.href = "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");
        });
    }
}());
