"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
llm.organizationRemarks = (() => {
    const urlPrefix = document.querySelector("main").dataset.urlPrefix;
    const getRemarksByOrganizationID = (organizationID, callbackFunction) => {
        cityssm.postJSON(urlPrefix + "/organizations/doGetRemarks", {
            organizationID
        }, callbackFunction);
    };
    const getRemarkByID = (organizationID, remarkIndex, callbackFunction) => {
        cityssm.postJSON(urlPrefix + "/organizations/doGetRemark", {
            organizationID,
            remarkIndex
        }, callbackFunction);
    };
    const doAddRemark = (formElement, callbackFunction) => {
        cityssm.postJSON(urlPrefix + "/organizations/doAddRemark", formElement, callbackFunction);
    };
    const openAddRemarkModal = (organizationID, updateCallbackFunction) => {
        let addRemarkCloseModalFunction;
        const addFormFunction = (formEvent) => {
            formEvent.preventDefault();
            doAddRemark(formEvent.currentTarget, () => {
                addRemarkCloseModalFunction();
                if (updateCallbackFunction) {
                    updateCallbackFunction();
                }
            });
        };
        cityssm.openHtmlModal("remarkAdd", {
            onshown(modalElement, closeModalFunction) {
                document.querySelector("#addRemark--organizationID").value = organizationID.toString();
                document.querySelector("#addRemark--remark").focus();
                modalElement.querySelector("form").addEventListener("submit", addFormFunction);
                addRemarkCloseModalFunction = closeModalFunction;
            }
        });
    };
    const doEditRemark = (formElement, callbackFunction) => {
        cityssm.postJSON(urlPrefix + "/organizations/doEditRemark", formElement, callbackFunction);
    };
    const openEditRemarkModal = (organizationID, remarkIndex, updateCallbackFunction) => {
        let editRemarkCloseModalFunction;
        const formFunction_edit = (formEvent) => {
            formEvent.preventDefault();
            doEditRemark(formEvent.currentTarget, () => {
                editRemarkCloseModalFunction();
                if (updateCallbackFunction) {
                    updateCallbackFunction();
                }
            });
        };
        cityssm.openHtmlModal("remarkEdit", {
            onshow(modalElement) {
                document.querySelector("#editRemark--organizationID").value = organizationID.toString();
                document.querySelector("#editRemark--remarkIndex").value = remarkIndex.toString();
                getRemarkByID(organizationID, remarkIndex, (remark) => {
                    const remarkElement = document.querySelector("#editRemark--remark");
                    remarkElement.value = remark.remark;
                    remarkElement.removeAttribute("placeholder");
                    document.querySelector("#editRemark--remarkDateString").value = remark.remarkDateString;
                    document.querySelector("#editRemark--remarkTimeString").value = remark.remarkTimeString;
                    if (remark.isImportant) {
                        document.querySelector("#editRemark--isImportant").setAttribute("checked", "checked");
                    }
                });
                modalElement.querySelector("form").addEventListener("submit", formFunction_edit);
            },
            onshown(_modalElement, closeModalFunction) {
                editRemarkCloseModalFunction = closeModalFunction;
                document.querySelector("#editRemark--remark").focus();
            }
        });
    };
    const doDeleteRemark = (organizationID, remarkIndex, callbackFunction) => {
        cityssm.postJSON(urlPrefix + "/organizations/doDeleteRemark", {
            organizationID,
            remarkIndex
        }, callbackFunction);
    };
    const deleteRemark = (organizationID, remarkIndex, doConfirm, deleteCallbackFunction) => {
        if (doConfirm) {
            cityssm.confirmModal("Delete Remark?", "Are you sure you want to delete this remark?", "Yes, Delete", "danger", () => {
                doDeleteRemark(organizationID, remarkIndex, deleteCallbackFunction);
            });
        }
        else {
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
