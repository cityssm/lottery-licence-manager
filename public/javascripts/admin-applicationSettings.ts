import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const getMessageEle = (formEle: HTMLFormElement | HTMLInputElement) => {
    return formEle.closest("tr").getElementsByClassName("formMessage")[0] as HTMLElement;
  };

  /*
   * Form
   */

  const submitFn = (formEvent: Event) => {

    formEvent.preventDefault();

    const formEle = formEvent.currentTarget as HTMLFormElement;
    const messageEle = getMessageEle(formEle);

    messageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(
      "/admin/doSaveApplicationSetting",
      formEle,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {

          messageEle.innerHTML = "<span class=\"has-text-success\">Updated Successfully</span>";

        } else {

          messageEle.innerHTML = "<span class=\"has-text-danger\">Update Error</span>";
        }
      }
    );
  };

  const changeFn = (inputEvent: Event) => {
    getMessageEle(inputEvent.currentTarget as HTMLInputElement).innerHTML =
      "<span class=\"has-text-info\">Unsaved Changes</span>";
  };


  const formEles = document.getElementsByClassName("form--applicationSetting") as HTMLCollectionOf<HTMLFormElement>;

  for (const formEle of formEles) {
    formEle.addEventListener("submit", submitFn);
    formEle.getElementsByClassName("input")[0].addEventListener("change", changeFn);
  }

})();
