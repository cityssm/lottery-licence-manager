/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const getMessageElement = (formElement: HTMLFormElement | HTMLInputElement) => {
    return formElement.closest("tr").querySelectorAll(".formMessage")[0] as HTMLElement;
  };

  /*
   * Form
   */

  const submitFunction = (formEvent: Event) => {

    formEvent.preventDefault();

    const formElement = formEvent.currentTarget as HTMLFormElement;
    const messageElement = getMessageElement(formElement);

    messageElement.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + "/admin/doSaveApplicationSetting",
      formElement,
      (responseJSON: { success: boolean }) => {

        messageElement.innerHTML = responseJSON.success
          ? "<span class=\"has-text-success\">Updated Successfully</span>"
          : "<span class=\"has-text-danger\">Update Error</span>";
      }
    );
  };

  const changeFunction = (inputEvent: Event) => {
    getMessageElement(inputEvent.currentTarget as HTMLInputElement).innerHTML =
      "<span class=\"has-text-info\">Unsaved Changes</span>";
  };


  const formElements = document.querySelectorAll(".form--applicationSetting") as NodeListOf<HTMLFormElement>;

  for (const formElement of formElements) {
    formElement.addEventListener("submit", submitFunction);
    formElement.querySelectorAll(".input")[0].addEventListener("change", changeFunction);
  }
})();
