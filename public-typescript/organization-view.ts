/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


if (document.querySelector("main").dataset.canUpdate === "true") {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const restoreButtonElement = document.querySelector(".is-restore-organization-button") as HTMLButtonElement;

  if (restoreButtonElement) {

    const organizationID = restoreButtonElement.dataset.organizationId;

    const restoreFunction = () => {

      cityssm.postJSON(urlPrefix + "/organizations/doRestore", {
        organizationID
      },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.href = urlPrefix + "/organizations/" + organizationID + "?_" + Date.now().toString();
          }
        }
      );
    };

    restoreButtonElement.addEventListener("click", () => {

      const organizationName = restoreButtonElement.dataset.organizationName;

      cityssm.confirmModal(
        "Restore " + organizationName + "?",
        "Are you sure you want to restore this organization?",
        "Yes, Restore",
        "warning",
        restoreFunction
      );
    });
  }
}
