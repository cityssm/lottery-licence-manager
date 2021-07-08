(() => {
    const toggleTableFunction = (clickEvent) => {
        clickEvent.preventDefault();
        const tableName = clickEvent.currentTarget.getAttribute("data-table");
        document.querySelector("#remindersTable--" + tableName)
            .classList.toggle("is-hidden");
    };
    const toggleLinkElements = document.querySelectorAll(".remindersTableToggle");
    for (const toggleLinkElement of toggleLinkElements) {
        toggleLinkElement.addEventListener("click", toggleTableFunction);
    }
})();
