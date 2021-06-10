(() => {
    const amendmentToggleLinkEle = document.getElementById("is-licence-amendment-toggle");
    if (amendmentToggleLinkEle) {
        amendmentToggleLinkEle.addEventListener("click", (event) => {
            event.preventDefault();
            const amendmentBlockEles = document.getElementsByClassName("is-licence-amendment-block");
            for (const blockEle of amendmentBlockEles) {
                blockEle.classList.toggle("is-hidden");
            }
        });
    }
    const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");
    if (ticketTypesPanelEle) {
        const tabEles = ticketTypesPanelEle.querySelectorAll(".panel-tabs a");
        const tabsFn_selectTab = (clickEvent) => {
            clickEvent.preventDefault();
            tabEles.forEach((tabEle) => {
                tabEle.classList.remove("is-active");
            });
            const selectedTabEle = clickEvent.currentTarget;
            selectedTabEle.classList.add("is-active");
            document.getElementById("ticketTypesTabPanel--summary").classList.add("is-hidden");
            document.getElementById("ticketTypesTabPanel--log").classList.add("is-hidden");
            document.getElementById(selectedTabEle.getAttribute("aria-controls")).classList.remove("is-hidden");
        };
        tabEles.forEach((tabEle) => {
            tabEle.addEventListener("click", tabsFn_selectTab);
        });
    }
})();
