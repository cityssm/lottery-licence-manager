"use strict";

llm.organizationRemarks = (function() {

  function getRemarksByOrganizationID(organizationID, callbackFn) {

    window.fetch("/organizations/doGetRemarks", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          organizationID: organizationID
        })
      })
      .then(function(response) {

        return response.json();

      })
      .then(callbackFn);

  }

  function getRemarkByID(organizationID, remarkIndex, callbackFn) {

    window.fetch("/organizations/doGetRemark", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          organizationID: organizationID,
          remarkIndex: remarkIndex
        })
      })
      .then(function(response) {

        return response.json();

      })
      .then(callbackFn);

  }


  function doAddRemark(formEle, callbackFn) {

    window.fetch("/organizations/doAddRemark", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {

        return response.json();

      })
      .then(callbackFn);

  }

  function openAddRemarkModal(organizationID, updateCallbackFn) {

    let addRemark_closeModalFn;

    const formFn_add = function(formEvent) {

      formEvent.preventDefault();

      doAddRemark(formEvent.currentTarget, function() {

        addRemark_closeModalFn();

        if (updateCallbackFn) {

          updateCallbackFn();

        }

      });

    };

    llm.openHtmlModal("remarkAdd", {
      onshown: function(modalEle, closeModalFn) {

        document.getElementById("addRemark--organizationID").value = organizationID;
        modalEle.getElementsByTagName("form")[0].addEventListener("submit", formFn_add);
        addRemark_closeModalFn = closeModalFn;

      }
    });

  }


  function doEditRemark(formEle, callbackFn) {

    window.fetch("/organizations/doEditRemark", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {

        return response.json();

      })
      .then(callbackFn);

  }

  function openEditRemarkModal(organizationID, remarkIndex, updateCallbackFn) {

    let editRemark_closeModalFn;

    const formFn_edit = function(formEvent) {

      formEvent.preventDefault();

      doEditRemark(formEvent.currentTarget, function() {

        editRemark_closeModalFn();

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

        editRemark_closeModalFn = closeModalFn;

      }
    });

  }


  function doDeleteRemark(organiztionID, remarkIndex, callbackFn) {

    window.fetch("/organizations/doDeleteRemark", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          organizationID: organiztionID,
          remarkIndex: remarkIndex
        })
      })
      .then(function(response) {

        return response.json();

      })
      .then(callbackFn);

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
