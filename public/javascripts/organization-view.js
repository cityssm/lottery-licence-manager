"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    if (document.getElementsByTagName("main")[0].getAttribute("data-can-update") === "true") {
        const restoreButtonEles = document.getElementsByClassName("is-restore-organization-button");
        if (restoreButtonEles.length > 0) {
            const buttonEle = restoreButtonEles[0];
            const organizationID = buttonEle.getAttribute("data-organization-id");
            const restoreFn = () => {
                cityssm.postJSON("/organizations/doRestore", {
                    organizationID: organizationID
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.href = "/organizations/" + organizationID + "?_" + Date.now().toString();
                    }
                });
            };
            buttonEle.addEventListener("click", () => {
                const organizationName = buttonEle.getAttribute("data-organization-name");
                cityssm.confirmModal("Restore " + organizationName + "?", "Are you sure you want to restore this organization?", "Yes, Restore", "warning", restoreFn);
            });
        }
    }
})();
