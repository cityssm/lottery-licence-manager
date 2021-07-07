(() => {
    const eventDateSelectElement = document.querySelector("#eventNav--eventDate");
    if (eventDateSelectElement) {
        eventDateSelectElement.addEventListener("change", () => {
            const urlPrefix = document.querySelector("main").getAttribute("data-url-prefix");
            const licenceID = eventDateSelectElement.getAttribute("data-licence-id");
            const newEventDate = eventDateSelectElement.value;
            const isEdit = eventDateSelectElement.getAttribute("data-is-edit") === "true";
            window.location.href = urlPrefix + "/events/" + licenceID + "/" + newEventDate + (isEdit ? "/edit" : "");
        });
    }
})();
