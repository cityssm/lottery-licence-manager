/* eslint-disable unicorn/filename-case */

(() => {

  // licence amendments

  const amendmentToggleLinkElement = document.querySelector("#is-licence-amendment-toggle");

  if (amendmentToggleLinkElement) {

    amendmentToggleLinkElement.addEventListener("click", (event) => {
      event.preventDefault();

      const amendmentBlockElements = document.querySelectorAll(".is-licence-amendment-block");

      for (const blockElement of amendmentBlockElements) {
        blockElement.classList.toggle("is-hidden");
      }
    });
  }

  // ticket types

  const ticketTypesPanelElement = document.querySelector("#is-ticket-types-panel");

  if (ticketTypesPanelElement) {

    const tabElements = ticketTypesPanelElement.querySelectorAll(".panel-tabs a");

    const tabsFunction_selectTab = (clickEvent: MouseEvent) => {
      clickEvent.preventDefault();

      for (const tabElement of tabElements) {
        tabElement.classList.remove("is-active");
      }

      const selectedTabElement = clickEvent.currentTarget as HTMLAnchorElement;
      selectedTabElement.classList.add("is-active");

      document.querySelector("#ticketTypesTabPanel--summary").classList.add("is-hidden");
      document.querySelector("#ticketTypesTabPanel--log").classList.add("is-hidden");

      document.querySelector("#" + selectedTabElement.getAttribute("aria-controls")).classList.remove("is-hidden");
    };

    for (const tabElement of tabElements) {
      tabElement.addEventListener("click", tabsFunction_selectTab);
    }
  }
})();
