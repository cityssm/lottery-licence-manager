(() => {
    const toggleTableFn = (clickEvent) => {
        clickEvent.preventDefault();
        const tableName = clickEvent.currentTarget.getAttribute("data-table");
        document.getElementById("remindersTable--" + tableName)
            .classList.toggle("is-hidden");
    };
    const toggleLinkEles = document.getElementsByClassName("remindersTableToggle");
    for (const toggleLinkEle of toggleLinkEles) {
        toggleLinkEle.addEventListener("click", toggleTableFn);
    }
})();
