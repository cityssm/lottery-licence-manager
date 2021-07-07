/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const restoreButtonElement = document.querySelector("#is-location-restore-button");

  if (restoreButtonElement) {

    const restoreFunction = () => {

      cityssm.postJSON(urlPrefix + "/locations/doRestore", {
        locationID: restoreButtonElement.getAttribute("data-location-id")
      },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.reload();
          }
        });
    };

    restoreButtonElement.addEventListener("click", () => {

      cityssm.confirmModal(
        "Restore Location?",
        "Are you sure you want to restore this location, and make it available for use again?",
        "Yes, Restore",
        "warning",
        restoreFunction
      );
    });
  }
})();
