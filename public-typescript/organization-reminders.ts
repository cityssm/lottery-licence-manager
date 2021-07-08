/* eslint-disable unicorn/filename-case */

(() => {

  const toggleTableFunction = (clickEvent: Event) => {

    clickEvent.preventDefault();
    const tableName = (clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-table");

    document.querySelector("#remindersTable--" + tableName)
      .classList.toggle("is-hidden");
  };

  const toggleLinkElements =
    document.querySelectorAll(".remindersTableToggle") as NodeListOf<HTMLAnchorElement>;

  for (const toggleLinkElement of toggleLinkElements) {
    toggleLinkElement.addEventListener("click", toggleTableFunction);
  }
})();
