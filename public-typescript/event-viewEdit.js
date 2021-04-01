(() => {
    const eventDateSelectEle = document.getElementById("eventNav--eventDate");
    if (eventDateSelectEle) {
        eventDateSelectEle.addEventListener("change", () => {
            const licenceID = eventDateSelectEle.getAttribute("data-licence-id");
            const newEventDate = eventDateSelectEle.value;
            const isEdit = eventDateSelectEle.getAttribute("data-is-edit") === "true";
            window.location.href = "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");
        });
    }
})();
