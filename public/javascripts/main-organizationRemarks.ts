import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/src/types";
declare const cityssm: cityssmGlobal;

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;

import type * as llmTypes from "../../helpers/llmTypes";


llm.organizationRemarks = (() => {

  const getRemarksByOrganizationID = (organizationID: number,
    callbackFn: (remarkList: llmTypes.OrganizationRemark[]) => void) => {

    cityssm.postJSON(
      "/organizations/doGetRemarks", {
        organizationID: organizationID
      },
      callbackFn
    );
  };

  const getRemarkByID = (organizationID: number, remarkIndex: number,
    callbackFn: (remark: llmTypes.OrganizationRemark) => void) => {

    cityssm.postJSON(
      "/organizations/doGetRemark", {
        organizationID: organizationID,
        remarkIndex: remarkIndex
      },
      callbackFn
    );
  };


  const doAddRemark = (formEle: HTMLFormElement, callbackFn: (response: {
    success: boolean,
    message: string,
    remarkIndex: number
  }) => void) => {

    cityssm.postJSON("/organizations/doAddRemark", formEle, callbackFn);
  };

  const openAddRemarkModal = (organizationID: number, updateCallbackFn: () => void) => {

    let addRemarkCloseModalFn: () => void;

    const addFormFn = (formEvent: Event) => {

      formEvent.preventDefault();

      doAddRemark(<HTMLFormElement>formEvent.currentTarget, () => {

        addRemarkCloseModalFn();

        if (updateCallbackFn) {
          updateCallbackFn();
        }
      });
    };

    cityssm.openHtmlModal("remarkAdd", {
      onshown(modalEle: HTMLElement, closeModalFn: () => void): void {

        (<HTMLInputElement>document.getElementById("addRemark--organizationID")).value = organizationID.toString();
        document.getElementById("addRemark--remark").focus();

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFormFn);

        addRemarkCloseModalFn = closeModalFn;
      }
    });

  };

  const doEditRemark = (formEle: HTMLFormElement, callbackFn: (response: {
    success: boolean,
    message: string
  }) => void) => {

    cityssm.postJSON("/organizations/doEditRemark", formEle, callbackFn);
  };

  const openEditRemarkModal = (organizationID: number, remarkIndex: number, updateCallbackFn: () => void) => {

    let editRemarkCloseModalFn: () => void;

    const formFn_edit = (formEvent: Event) => {

      formEvent.preventDefault();

      doEditRemark(<HTMLFormElement>formEvent.currentTarget, () => {

        editRemarkCloseModalFn();

        if (updateCallbackFn) {
          updateCallbackFn();
        }
      });
    };

    cityssm.openHtmlModal("remarkEdit", {
      onshow(modalEle: HTMLElement): void {

        (<HTMLInputElement>document.getElementById("editRemark--organizationID")).value = organizationID.toString();
        (<HTMLInputElement>document.getElementById("editRemark--remarkIndex")).value = remarkIndex.toString();

        getRemarkByID(organizationID, remarkIndex, (remark) => {

          const remarkEle = <HTMLTextAreaElement>document.getElementById("editRemark--remark");
          remarkEle.value = remark.remark;
          remarkEle.removeAttribute("placeholder");

          (<HTMLInputElement>document.getElementById("editRemark--remarkDateString")).value = remark.remarkDateString;
          (<HTMLInputElement>document.getElementById("editRemark--remarkTimeString")).value = remark.remarkTimeString;

          if (remark.isImportant) {
            document.getElementById("editRemark--isImportant").setAttribute("checked", "checked");
          }
        });

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", formFn_edit);

      },
      onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

        editRemarkCloseModalFn = closeModalFn;
        document.getElementById("editRemark--remark").focus();
      }
    });
  };

  const doDeleteRemark = (organiztionID: number, remarkIndex: number, callbackFn: (response: {
    success: boolean,
    message: string
  }) => void) => {

    cityssm.postJSON(
      "/organizations/doDeleteRemark", {
        organizationID: organiztionID,
        remarkIndex: remarkIndex
      },
      callbackFn
    );
  };

  const deleteRemark = (organizationID: number, remarkIndex: number, doConfirm: boolean,
    deleteCallbackFn: (response: {
      success: boolean,
      message: string
    }) => void) => {

    if (doConfirm) {

      cityssm.confirmModal(
        "Delete Remark?",
        "Are you sure you want to delete this remark?",
        "Yes, Delete",
        "danger",
        () => {
          doDeleteRemark(organizationID, remarkIndex, deleteCallbackFn);
        }
      );

    } else {
      doDeleteRemark(organizationID, remarkIndex, deleteCallbackFn);
    }
  };


  return {
    getRemarksByOrganizationID,
    getRemarkByID,
    openAddRemarkModal,
    openEditRemarkModal,
    deleteRemark
  };

})();
