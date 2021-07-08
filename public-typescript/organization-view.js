"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (document.querySelector("main").dataset.canUpdate === "true") {
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    const restoreButtonElement = document.querySelector(".is-restore-organization-button");
    if (restoreButtonElement) {
        const organizationID = restoreButtonElement.dataset.organizationId;
        const restoreFunction = () => {
            cityssm.postJSON(urlPrefix + "/organizations/doRestore", {
                organizationID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    window.location.href = urlPrefix + "/organizations/" + organizationID + "?_" + Date.now().toString();
                }
            });
        };
        restoreButtonElement.addEventListener("click", () => {
            const organizationName = restoreButtonElement.dataset.organizationName;
            cityssm.confirmModal("Restore " + organizationName + "?", "Are you sure you want to restore this organization?", "Yes, Restore", "warning", restoreFunction);
        });
    }
}
