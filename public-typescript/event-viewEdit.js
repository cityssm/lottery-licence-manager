(() => {
    const eventDateSelectEle = document.getElementById("eventNav--eventDate");
    if (eventDateSelectEle) {
        eventDateSelectEle.addEventListener("change", () => {
            const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");
            const licenceID = eventDateSelectEle.getAttribute("data-licence-id");
            const newEventDate = eventDateSelectEle.value;
            const isEdit = eventDateSelectEle.getAttribute("data-is-edit") === "true";
            window.location.href = urlPrefix + "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");
        });
    }
})();
