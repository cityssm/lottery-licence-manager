import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/types";
declare const cityssm: cityssmGlobal;


(function() {

  function getMessageEle(formEle: HTMLFormElement | HTMLInputElement) {
    return formEle.closest("tr").getElementsByClassName("formMessage")[0];
  }

  /*
   * Form
   */

  function submitFn(formEvent: Event) {

    formEvent.preventDefault();

    const formEle = <HTMLFormElement>formEvent.currentTarget;
    const messageEle = getMessageEle(formEle);

    messageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(
      "/admin/doSaveApplicationSetting",
      formEle,
      function(responseJSON) {

        if (responseJSON.success) {

          messageEle.innerHTML = "<span class=\"has-text-success\">Updated Successfully</span>";

        } else {

          messageEle.innerHTML = "<span class=\"has-text-danger\">Update Error</span>";

        }

      }
    );

  }

  function changeFn(inputEvent: Event) {

    getMessageEle(<HTMLInputElement>inputEvent.currentTarget).innerHTML = "<span class=\"has-text-info\">Unsaved Changes</span>";

  }


  const formEles = document.getElementsByClassName("form--applicationSetting");

  for (let formIndex = 0; formIndex < formEles.length; formIndex += 1) {

    formEles[formIndex].addEventListener("submit", submitFn);
    formEles[formIndex].getElementsByClassName("input")[0].addEventListener("change", changeFn);

  }

}());
