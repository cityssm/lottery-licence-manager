(() => {

  const toggleTableFn = (clickEvent: Event) => {

    clickEvent.preventDefault();
    const tableName = (clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-table");

    document.getElementById("remindersTable--" + tableName)
      .classList.toggle("is-hidden");
  };

  const toggleLinkEles =
    document.getElementsByClassName("remindersTableToggle") as HTMLCollectionOf<HTMLAnchorElement>;

  for (const toggleLinkEle of toggleLinkEles) {
    toggleLinkEle.addEventListener("click", toggleTableFn);
  }
})();
