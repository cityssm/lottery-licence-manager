"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelectorAll("main")[0].getAttribute("data-url-prefix");
    const getMessageElement = (formElement) => {
        return formElement.closest("tr").querySelectorAll(".formMessage")[0];
    };
    const submitFunction = (formEvent) => {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        const messageElement = getMessageElement(formElement);
        messageElement.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON(urlPrefix + "/admin/doSaveApplicationSetting", formElement, (responseJSON) => {
            messageElement.innerHTML = responseJSON.success
                ? "<span class=\"has-text-success\">Updated Successfully</span>"
                : "<span class=\"has-text-danger\">Update Error</span>";
        });
    };
    const changeFunction = (inputEvent) => {
        getMessageElement(inputEvent.currentTarget).innerHTML =
            "<span class=\"has-text-info\">Unsaved Changes</span>";
    };
    const formElements = document.querySelectorAll(".form--applicationSetting");
    for (const formElement of formElements) {
        formElement.addEventListener("submit", submitFunction);
        formElement.querySelectorAll(".input")[0].addEventListener("change", changeFunction);
    }
})();
