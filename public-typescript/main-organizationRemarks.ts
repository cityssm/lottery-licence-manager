/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


llm.organizationRemarks = (() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const getRemarksByOrganizationID = (organizationID: number,
    callbackFunction: (remarkList: llmTypes.OrganizationRemark[]) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doGetRemarks", {
      organizationID
    },
      callbackFunction
    );
  };

  const getRemarkByID = (organizationID: number, remarkIndex: number,
    callbackFunction: (remark: llmTypes.OrganizationRemark) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doGetRemark", {
      organizationID,
      remarkIndex
    },
      callbackFunction
    );
  };


  const doAddRemark = (formElement: HTMLFormElement, callbackFunction: (response: {
    success: boolean;
    message: string;
    remarkIndex: number;
  }) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doAddRemark",
      formElement, callbackFunction);
  };

  const openAddRemarkModal = (organizationID: number, updateCallbackFunction: () => void) => {

    let addRemarkCloseModalFunction: () => void;

    const addFormFunction = (formEvent: Event) => {

      formEvent.preventDefault();

      doAddRemark(formEvent.currentTarget as HTMLFormElement, () => {

        addRemarkCloseModalFunction();

        if (updateCallbackFunction) {
          updateCallbackFunction();
        }
      });
    };

    cityssm.openHtmlModal("remarkAdd", {
      onshown(modalElement, closeModalFunction) {

        (document.querySelector("#addRemark--organizationID") as HTMLInputElement).value = organizationID.toString();
        (document.querySelector("#addRemark--remark") as HTMLTextAreaElement).focus();

        modalElement.querySelector("form").addEventListener("submit", addFormFunction);

        addRemarkCloseModalFunction = closeModalFunction;
      }
    });
  };

  const doEditRemark = (formElement: HTMLFormElement, callbackFunction: (response: {
    success: boolean;
    message: string;
  }) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doEditRemark",
      formElement,
      callbackFunction);
  };

  const openEditRemarkModal = (organizationID: number, remarkIndex: number, updateCallbackFunction: () => void) => {

    let editRemarkCloseModalFunction: () => void;

    const formFunction_edit = (formEvent: Event) => {

      formEvent.preventDefault();

      doEditRemark(formEvent.currentTarget as HTMLFormElement, () => {

        editRemarkCloseModalFunction();

        if (updateCallbackFunction) {
          updateCallbackFunction();
        }
      });
    };

    cityssm.openHtmlModal("remarkEdit", {
      onshow(modalElement) {

        (document.querySelector("#editRemark--organizationID") as HTMLInputElement).value = organizationID.toString();
        (document.querySelector("#editRemark--remarkIndex") as HTMLInputElement).value = remarkIndex.toString();

        getRemarkByID(organizationID, remarkIndex, (remark) => {

          const remarkElement = document.querySelector("#editRemark--remark") as HTMLTextAreaElement;
          remarkElement.value = remark.remark;
          remarkElement.removeAttribute("placeholder");

          (document.querySelector("#editRemark--remarkDateString") as HTMLInputElement).value = remark.remarkDateString;
          (document.querySelector("#editRemark--remarkTimeString") as HTMLInputElement).value = remark.remarkTimeString;

          if (remark.isImportant) {
            document.querySelector("#editRemark--isImportant").setAttribute("checked", "checked");
          }
        });

        modalElement.querySelector("form").addEventListener("submit", formFunction_edit);

      },
      onshown(_modalElement, closeModalFunction) {

        editRemarkCloseModalFunction = closeModalFunction;
        (document.querySelector("#editRemark--remark") as HTMLTextAreaElement).focus();
      }
    });
  };

  const doDeleteRemark = (organizationID: number, remarkIndex: number, callbackFunction: (response: {
    success: boolean;
    message: string;
  }) => void) => {

    cityssm.postJSON(urlPrefix + "/organizations/doDeleteRemark", {
      organizationID,
      remarkIndex
    },
      callbackFunction
    );
  };

  const deleteRemark = (organizationID: number, remarkIndex: number, doConfirm: boolean,
    deleteCallbackFunction: (response: {
      success: boolean;
      message: string;
    }) => void) => {

    if (doConfirm) {

      cityssm.confirmModal(
        "Delete Remark?",
        "Are you sure you want to delete this remark?",
        "Yes, Delete",
        "danger",
        () => {
          doDeleteRemark(organizationID, remarkIndex, deleteCallbackFunction);
        }
      );

    } else {
      doDeleteRemark(organizationID, remarkIndex, deleteCallbackFunction);
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
