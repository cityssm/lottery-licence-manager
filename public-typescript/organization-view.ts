import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  if (document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true") {

    const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

    const restoreButtonEles = document.getElementsByClassName("is-restore-organization-button");

    if (restoreButtonEles.length > 0) {

      const buttonEle = restoreButtonEles[0];

      const organizationID = buttonEle.getAttribute("data-organization-id");

      const restoreFn = () => {

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

      buttonEle.addEventListener("click", () => {

        const organizationName = buttonEle.getAttribute("data-organization-name");

        cityssm.confirmModal(
          "Restore " + organizationName + "?",
          "Are you sure you want to restore this organization?",
          "Yes, Restore",
          "warning",
          restoreFn
        );
      });
    }
  }
})();
