"use strict";

llm.organizationRemarks = (function() {

  function getRemarksByOrganizationID(organizationID, callbackFn) {

    llm.postJSON(
      "/organizations/doGetRemarks", {
        organizationID: organizationID
      },
      callbackFn
    );

  }

  function getRemarkByID(organizationID, remarkIndex, callbackFn) {

    llm.postJSON(
      "/organizations/doGetRemark", {
        organizationID: organizationID,
        remarkIndex: remarkIndex
      },
      callbackFn
    );

  }


  function doAddRemark(formEle, callbackFn) {

    llm.postJSON("/organizations/doAddRemark", formEle, callbackFn);

  }

  function openAddRemarkModal(organizationID, updateCallbackFn) {

    let addRemarkCloseModalFn;

    const addFormFn = function(formEvent) {

      formEvent.preventDefault();

      doAddRemark(formEvent.currentTarget, function() {

        addRemarkCloseModalFn();

        if (updateCallbackFn) {

          updateCallbackFn();

        }

      });

    };

    llm.openHtmlModal("remarkAdd", {
      onshown: function(modalEle, closeModalFn) {

        document.getElementById("addRemark--organizationID").value = organizationID;
        document.getElementById("addRemark--remark").focus();

        modalEle.getElementsByTagName("form")[0].addEventListener("submit", addFormFn);

        addRemarkCloseModalFn = closeModalFn;

      }
    });

  }

  function doEditRemark(formEle, callbackFn) {

    llm.postJSON("/organizations/doEditRemark", formEle, callbackFn);

  }

  function openEditRemarkModal(organizationID, remarkIndex, updateCallbackFn) {

    let editRemarkCloseModalFn;

    const formFn_edit = function(formEvent) {

      formEvent.preventDefault();

      doEditRemark(formEvent.currentTarget, function() {

        editRemarkCloseModalFn();

        if (updateCallbackFn) {

          updateCallbackFn();

        }

      });

    };

    llm.openHtmlModal("remarkEdit", {
      onshow: function(modalEle) {

        document.getElementById("editRemark--organizationID").value = organizationID;
        document.getElementById("editRemark--remarkIndex").value = remarkIndex;

        getRemarkByID(organizationID, remarkIndex, function(remark) {

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
      onshown: function(modalEle, closeModalFn) {

        editRemarkCloseModalFn = closeModalFn;
        document.getElementById("editRemark--remark").focus();

      }
    });

  }

  function doDeleteRemark(organiztionID, remarkIndex, callbackFn) {

    llm.postJSON(
      "/organizations/doDeleteRemark", {
        organizationID: organiztionID,
        remarkIndex: remarkIndex
      },
      callbackFn
    );

  }

  function deleteRemark(organizationID, remarkIndex, doConfirm, deleteCallbackFn) {

    if (doConfirm) {

      llm.confirmModal(
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
