llm.organizationRemarks = (() => {
    const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");
    const getRemarksByOrganizationID = (organizationID, callbackFn) => {
        cityssm.postJSON(urlPrefix + "/organizations/doGetRemarks", {
            organizationID
        }, callbackFn);
    };
    const getRemarkByID = (organizationID, remarkIndex, callbackFn) => {
        cityssm.postJSON(urlPrefix + "/organizations/doGetRemark", {
            organizationID,
            remarkIndex
        }, callbackFn);
    };
    const doAddRemark = (formEle, callbackFn) => {
        cityssm.postJSON(urlPrefix + "/organizations/doAddRemark", formEle, callbackFn);
    };
    const openAddRemarkModal = (organizationID, updateCallbackFn) => {
        let addRemarkCloseModalFn;
        const addFormFn = (formEvent) => {
            formEvent.preventDefault();
            doAddRemark(formEvent.currentTarget, () => {
                addRemarkCloseModalFn();
                if (updateCallbackFn) {
                    updateCallbackFn();
                }
            });
        };
        cityssm.openHtmlModal("remarkAdd", {
            onshown(modalEle, closeModalFn) {
                document.getElementById("addRemark--organizationID").value = organizationID.toString();
                document.getElementById("addRemark--remark").focus();
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFormFn);
                addRemarkCloseModalFn = closeModalFn;
            }
        });
    };
    const doEditRemark = (formEle, callbackFn) => {
        cityssm.postJSON(urlPrefix + "/organizations/doEditRemark", formEle, callbackFn);
    };
    const openEditRemarkModal = (organizationID, remarkIndex, updateCallbackFn) => {
        let editRemarkCloseModalFn;
        const formFn_edit = (formEvent) => {
            formEvent.preventDefault();
            doEditRemark(formEvent.currentTarget, () => {
                editRemarkCloseModalFn();
                if (updateCallbackFn) {
                    updateCallbackFn();
                }
            });
        };
        cityssm.openHtmlModal("remarkEdit", {
            onshow(modalEle) {
                document.getElementById("editRemark--organizationID").value = organizationID.toString();
                document.getElementById("editRemark--remarkIndex").value = remarkIndex.toString();
                getRemarkByID(organizationID, remarkIndex, (remark) => {
                    const remarkEle = document.getElementById("editRemark--remark");
                    remarkEle.value = remark.remark;
                    remarkEle.removeAttribute("placeholder");
                    document.getElementById("editRemark--remarkDateString").value = remark.remarkDateString;
                    document.getElementById("editRemark--remarkTimeString").value = remark.remarkTimeString;
                    if (remark.isImportant) {
                        document.getElementById("editRemark--isImportant").setAttribute("checked", "checked");
                    }
                });
                modalEle.getElementsByTagName("form")[0].addEventListener("submit", formFn_edit);
            },
            onshown(_modalEle, closeModalFn) {
                editRemarkCloseModalFn = closeModalFn;
                document.getElementById("editRemark--remark").focus();
            }
        });
    };
    const doDeleteRemark = (organizationID, remarkIndex, callbackFn) => {
        cityssm.postJSON(urlPrefix + "/organizations/doDeleteRemark", {
            organizationID,
            remarkIndex
        }, callbackFn);
    };
    const deleteRemark = (organizationID, remarkIndex, doConfirm, deleteCallbackFn) => {
        if (doConfirm) {
            cityssm.confirmModal("Delete Remark?", "Are you sure you want to delete this remark?", "Yes, Delete", "danger", () => {
                doDeleteRemark(organizationID, remarkIndex, deleteCallbackFn);
            });
        }
        else {
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
export {};
