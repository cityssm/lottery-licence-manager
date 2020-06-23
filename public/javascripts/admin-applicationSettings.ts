import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;


(() => {

  const getMessageEle = (formEle: HTMLFormElement | HTMLInputElement): HTMLElement => {
    return <HTMLElement>formEle.closest("tr").getElementsByClassName("formMessage")[0];
  };

  /*
   * Form
   */

  const submitFn = (formEvent: Event) => {

    formEvent.preventDefault();

    const formEle = <HTMLFormElement>formEvent.currentTarget;
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
    getMessageEle(<HTMLInputElement>inputEvent.currentTarget).innerHTML =
      "<span class=\"has-text-info\">Unsaved Changes</span>";
  };


  const formEles = <HTMLCollectionOf<HTMLFormElement>>document.getElementsByClassName("form--applicationSetting");

  for (const formEle of formEles) {
    formEle.addEventListener("submit", submitFn);
    formEle.getElementsByClassName("input")[0].addEventListener("change", changeFn);
  }

})();
