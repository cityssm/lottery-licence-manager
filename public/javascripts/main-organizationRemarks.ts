import type { cityssmGlobal } from "../../node_modules/@cityssm/bulma-webapp-js/types";
declare const cityssm: cityssmGlobal;

import type { llmGlobal } from "./types";
declare const llm: llmGlobal;

import type * as llmTypes from "../../helpers/llmTypes";


llm.organizationRemarks = (function() {

  function getRemarksByOrganizationID(organizationID: number,
    callbackFn: (remarkList: llmTypes.OrganizationRemark[]) => void) {

    cityssm.postJSON(
      "/organizations/doGetRemarks", {
        organizationID: organizationID
      },
      callbackFn
    );

  }

  function getRemarkByID(organizationID: number, remarkIndex: number,
    callbackFn: (remark: llmTypes.OrganizationRemark) => void) {

    cityssm.postJSON(
      "/organizations/doGetRemark", {
        organizationID: organizationID,
        remarkIndex: remarkIndex
      },
      callbackFn
    );

  }


  function doAddRemark(formEle: HTMLFormElement, callbackFn: (response: {
    success: boolean,
    message: string,
    remarkIndex: number
  }) => void) {

    cityssm.postJSON("/organizations/doAddRemark", formEle, callbackFn);

  }

  function openAddRemarkModal(organizationID: number, updateCallbackFn: () => void) {

    let addRemarkCloseModalFn: Function;

    const addFormFn = function(formEvent: Event) {

      formEvent.preventDefault();

      doAddRemark(<HTMLFormElement>formEvent.currentTarget, function() {

        addRemarkCloseModalFn();

        if (updateCallbackFn) {

          updateCallbackFn();

        }

      });

    };

    cityssm.openHtmlModal("remarkAdd", {
      onshown: function(modalEle, closeModalFn) {

        (<HTMLInputElement>document.getElementById("addRemark--organizationID")).value = organizationID.toString();
        document.getElementById("addRemark--remark").focus();

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFormFn);

        addRemarkCloseModalFn = closeModalFn;

      }
    });

  }

  function doEditRemark(formEle: HTMLFormElement, callbackFn: (response: {
    success: boolean,
    message: string
  }) => void) {

    cityssm.postJSON("/organizations/doEditRemark", formEle, callbackFn);

  }

  function openEditRemarkModal(organizationID: number, remarkIndex: number, updateCallbackFn: () => void) {

    let editRemarkCloseModalFn: Function;

    const formFn_edit = function(formEvent: Event) {

      formEvent.preventDefault();

      doEditRemark(<HTMLFormElement>formEvent.currentTarget, function() {

        editRemarkCloseModalFn();

        if (updateCallbackFn) {

          updateCallbackFn();

        }

      });

    };

    cityssm.openHtmlModal("remarkEdit", {
      onshow: function(modalEle) {

        (<HTMLInputElement>document.getElementById("editRemark--organizationID")).value = organizationID.toString();
        (<HTMLInputElement>document.getElementById("editRemark--remarkIndex")).value = remarkIndex.toString();

        getRemarkByID(organizationID, remarkIndex, function(remark) {

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
      onshown: function(modalEle, closeModalFn) {

        editRemarkCloseModalFn = closeModalFn;
        document.getElementById("editRemark--remark").focus();

      }
    });

  }

  function doDeleteRemark(organiztionID: number, remarkIndex: number, callbackFn: (response: {
    success: boolean,
    message: string
  }) => void) {

    cityssm.postJSON(
      "/organizations/doDeleteRemark", {
        organizationID: organiztionID,
        remarkIndex: remarkIndex
      },
      callbackFn
    );

  }

  function deleteRemark(organizationID: number, remarkIndex: number, doConfirm: boolean,
    deleteCallbackFn: (response: {
      success: boolean,
      message: string
    }) => void) {

    if (doConfirm) {

      cityssm.confirmModal(
        "Delete Remark?",
        "Are you sure you want to delete this remark?",
        "Yes, Delete",
        "danger",
        function() {

          doDeleteRemark(organizationID, remarkIndex, deleteCallbackFn);

        }
      );

    } else {

      doDeleteRemark(organizationID, remarkIndex, deleteCallbackFn);

    }

  }


  return {

    getRemarksByOrganizationID: getRemarksByOrganizationID,

    getRemarkByID: getRemarkByID,

    openAddRemarkModal: openAddRemarkModal,

    openEditRemarkModal: openEditRemarkModal,

    deleteRemark: deleteRemark
  };

}());
