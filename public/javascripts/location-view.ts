import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const restoreButtonEle = document.getElementById("is-location-restore-button");

  if (restoreButtonEle) {

    const restoreFn = () => {

      cityssm.postJSON("doRestore", {
        locationID: restoreButtonEle.getAttribute("data-location-id")
      },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.reload(true);
          }
        });
    };

    restoreButtonEle.addEventListener("click", () => {

      cityssm.confirmModal(
        "Restore Location?",
        "Are you sure you want to restore this location, and make it available for use again?",
        "Yes, Restore",
        "warning",
        restoreFn
      );
    });
  }
})();
