/* global window, document */
/* global URLSearchParams, FormData */


(function() {
  "use strict";

  const formEle = document.getElementById("form--organization");
  const formMessageEle = document.getElementById("container--form-message");
  const organizationID = document.getElementById("organization--organizationID").value;
  const isCreate = organizationID === "";

  // Main record update

  formEle.addEventListener("submit", function(formEvent) {
    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    window.fetch("/organizations/doSave", {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams(new FormData(formEle))
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(responseJSON) {

        if (responseJSON.success) {
          window.llm.disableNavBlocker();
        }

        if (responseJSON.success && isCreate) {
          window.location.href = "/organizations/" + responseJSON.organizationID + "/edit";

        } else {
          formMessageEle.innerHTML = "";

          window.llm.alertModal(responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger");
        }
      });
  });


  if (!isCreate) {

    const deleteOrganizationFn = function() {

      window.fetch("/organizations/doDelete", {
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
        .then(function(responseJSON) {
          if (responseJSON.success) {
            window.location.href = "/organizations";
          }
        });
    };

    formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", function() {

      window.llm.confirmModal("Delete Organization?",
        ("Are you sure you want to delete this organization?<br />" +
          "Note that any active licences issued to this organization will remain active."),
        "Yes, Delete Organization",
        "warning",
        deleteOrganizationFn);
    });

    /*
     * Representatives
     */

    const representativeTbodyEle = document.getElementsByClassName("is-representative-table")[0].getElementsByTagName("tbody")[0];

    const showNoRepresentativesWarning = function() {
      if (representativeTbodyEle.getElementsByTagName("tr").length === 0) {

        representativeTbodyEle.innerHTML = "<tr class=\"has-background-warning is-empty-warning\">" +
          "<td class=\"has-text-centered\" colspan=\"6\"><strong>There are no representatives associated with this organization.</strong></td>" +
          "</tr>";
      }
    };

    showNoRepresentativesWarning();

    // Default toggle

    const updateDefaultRepresentativeFn = function(changeEvent) {

      const defaultRepresentativeIndex = changeEvent.currentTarget.value;

      window.fetch("/organizations/" + organizationID + "/doSetDefaultRepresentative", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            isDefaultRepresentativeIndex: defaultRepresentativeIndex
          })
        })
        .then(function(response) {
          return response.json();
        });
    };

    const radioEles = representativeTbodyEle.getElementsByTagName("input");

    let eleIndex;

    for (eleIndex = 0; eleIndex < radioEles.length; eleIndex += 1) {
      radioEles[eleIndex].addEventListener("change", updateDefaultRepresentativeFn);
    }

    // delete

    const deleteRepresentativeFn = function(clickEvent) {

      clickEvent.preventDefault();

      const trEle = clickEvent.currentTarget.closest("tr");

      const representativeName = trEle.getAttribute("data-representative-name");

      window.llm.confirmModal("Delete a Representative?",
        "<p>Are you sure you want to delete the representative \"" + representativeName + "\"?</p>",
        "Yes, Delete",
        "danger",
        function() {

          window.fetch("/organizations/" + organizationID + "/doDeleteOrganizationRepresentative", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                representativeIndex: trEle.getAttribute("data-representative-index")
              })
            })
            .then(function(response) {
              return response.json();
            })
            .then(function(responseJSON) {
              if (responseJSON.success) {
                trEle.remove();
                showNoRepresentativesWarning();
              }
            });
        });
    };

    const deleteBtnEles = representativeTbodyEle.getElementsByClassName("is-delete-representative-button");

    for (eleIndex = 0; eleIndex < deleteBtnEles.length; eleIndex += 1) {
      deleteBtnEles[eleIndex].addEventListener("click", deleteRepresentativeFn);
    }

    // add / edit

    const editRepresentativeModalEle = document.getElementsByClassName("is-edit-representative-modal")[0];
    const editRepresentativeFormEle = editRepresentativeModalEle.getElementsByTagName("form")[0];

    let editRepresentativeTrEle;

    let openEditRepresentativeModalFn = function(clickEvent) {

      editRepresentativeTrEle = clickEvent.currentTarget.closest("tr");

      const representativeIndex = editRepresentativeTrEle.getAttribute("data-representative-index");

      document.getElementById("editOrganizationRepresentative--representativeIndex").value = representativeIndex;
      document.getElementById("editOrganizationRepresentative--representativeName").value = editRepresentativeTrEle.getAttribute("data-representative-name");
      document.getElementById("editOrganizationRepresentative--representativeTitle").value = editRepresentativeTrEle.getAttribute("data-representative-title");
      document.getElementById("editOrganizationRepresentative--representativeAddress1").value = editRepresentativeTrEle.getAttribute("data-representative-address-1");
      document.getElementById("editOrganizationRepresentative--representativeAddress2").value = editRepresentativeTrEle.getAttribute("data-representative-address-2");
      document.getElementById("editOrganizationRepresentative--representativeCity").value = editRepresentativeTrEle.getAttribute("data-representative-city");
      document.getElementById("editOrganizationRepresentative--representativeProvince").value = editRepresentativeTrEle.getAttribute("data-representative-province");
      document.getElementById("editOrganizationRepresentative--representativePostalCode").value = editRepresentativeTrEle.getAttribute("data-representative-postal-code");
      document.getElementById("editOrganizationRepresentative--representativePhoneNumber").value = editRepresentativeTrEle.getAttribute("data-representative-phone-number");
      document.getElementById("editOrganizationRepresentative--representativeEmailAddress").value = editRepresentativeTrEle.getAttribute("data-representative-email-address");

      document.getElementById("editOrganizationRepresentative--isDefault").value = document.getElementById("representative-isDefault--" + representativeIndex).checked ? "1" : "0";

      window.llm.showModal(editRepresentativeModalEle);
    };

    const insertRepresentativeRowFn = function(representativeObj) {

      const trEle = document.createElement("tr");

      trEle.setAttribute("data-representative-index", representativeObj.representativeIndex);
      trEle.setAttribute("data-representative-name", representativeObj.representativeName);
      trEle.setAttribute("data-representative-title", representativeObj.representativeTitle);
      trEle.setAttribute("data-representative-address-1", representativeObj.representativeAddress1);
      trEle.setAttribute("data-representative-address-2", representativeObj.representativeAddress2);
      trEle.setAttribute("data-representative-city", representativeObj.representativeCity);
      trEle.setAttribute("data-representative-province", representativeObj.representativeProvince);
      trEle.setAttribute("data-representative-postal-code", representativeObj.representativePostalCode);
      trEle.setAttribute("data-representative-phone-number", representativeObj.representativePhoneNumber);
      trEle.setAttribute("data-representative-email-address", representativeObj.representativeEmailAddress);

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<div class=\"field\">" +
        "<input class=\"is-checkradio is-info\" id=\"representative-isDefault--" + representativeObj.representativeIndex + "\" name=\"representative-isDefault\" type=\"radio\"" + (representativeObj.isDefault ? " checked" : "") + " />&nbsp;" +
        "<label for=\"representative-isDefault--" + representativeObj.representativeIndex + "\"></label>" +
        "</div>" +
        "</td>");

      trEle.getElementsByTagName("input")[0].addEventListener("change", updateDefaultRepresentativeFn);

      let tdEle = document.createElement("td");
      tdEle.innerHTML = representativeObj.representativeName + "<br />" +
        "<small>" + representativeObj.representativeTitle + "</small>";
      trEle.insertAdjacentElement("beforeend", tdEle);

      tdEle = document.createElement("td");
      tdEle.innerHTML = representativeObj.representativeAddress1 + "<br />" +
        "<small>" +
        (representativeObj.representativeAddress2 === "" ? "" : representativeObj.representativeAddress2 + "<br />") +
        representativeObj.representativeCity + ", " + representativeObj.representativeProvince + "<br />" +
        representativeObj.representativePostalCode +
        "</small>";
      trEle.insertAdjacentElement("beforeend", tdEle);

      tdEle = document.createElement("td");
      tdEle.innerHTML = representativeObj.representativePhoneNumber;
      trEle.insertAdjacentElement("beforeend", tdEle);

      tdEle = document.createElement("td");
      tdEle.innerHTML = representativeObj.representativeEmailAddress;
      trEle.insertAdjacentElement("beforeend", tdEle);

      trEle.insertAdjacentHTML("beforeend", "<td>" +
        "<div class=\"buttons is-right has-addons\">" +
        "<button class=\"button is-small is-edit-representative-button\" data-tooltip=\"Edit Representative\" type=\"button\">" +
        "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
        "<span>Edit</span></button>" +
        "<button class=\"button is-small has-text-danger is-delete-representative-button\" data-tooltip=\"Delete Representative\" type=\"button\">" +
        "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Delete</span>" +
        "</button>" +
        "</td>");

      trEle.getElementsByClassName("is-edit-representative-button")[0].addEventListener("click", openEditRepresentativeModalFn);
      trEle.getElementsByClassName("is-delete-representative-button")[0].addEventListener("click", deleteRepresentativeFn);

      representativeTbodyEle.insertAdjacentElement("beforeend", trEle);
    };

    // edit

    const editBtnEles = representativeTbodyEle.getElementsByClassName("is-edit-representative-button");

    for (eleIndex = 0; eleIndex < editBtnEles.length; eleIndex += 1) {
      editBtnEles[eleIndex].addEventListener("click", openEditRepresentativeModalFn);
    }

    // close edit
    let cancelButtonEles = editRepresentativeModalEle.getElementsByClassName("is-cancel-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
      cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
    }

    editRepresentativeFormEle.addEventListener("submit", function(formEvent) {
      formEvent.preventDefault();

      window.fetch("/organizations/" + organizationID + "/doEditOrganizationRepresentative", {
          method: "POST",
          credentials: "include",
          body: new URLSearchParams(new FormData(formEvent.currentTarget))
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(responseJSON) {

          if (responseJSON.success) {

            editRepresentativeTrEle.remove();
            editRepresentativeTrEle = null;

            // create row

            insertRepresentativeRowFn(responseJSON.organizationRepresentative);
            window.llm.hideModal(editRepresentativeModalEle);
          }
        });
    });

    // Add

    const addRepresentativeModalEle = document.getElementsByClassName("is-add-representative-modal")[0];
    const addRepresentativeFormEle = addRepresentativeModalEle.getElementsByTagName("form")[0];

    // open add
    document.getElementsByClassName("is-add-representative-button")[0].addEventListener("click", function() {
      addRepresentativeFormEle.reset();
      window.llm.showModal(addRepresentativeModalEle);
      document.getElementById("addOrganizationRepresentative--representativeName").focus();
    });

    // close add
    cancelButtonEles = addRepresentativeModalEle.getElementsByClassName("is-cancel-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
      cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
    }

    addRepresentativeFormEle.addEventListener("submit", function(formEvent) {
      formEvent.preventDefault();

      window.fetch("/organizations/" + organizationID + "/doAddOrganizationRepresentative", {
          method: "POST",
          credentials: "include",
          body: new URLSearchParams(new FormData(formEvent.currentTarget))
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(responseJSON) {

          if (responseJSON.success) {

            // remove empty warning

            let emptyWarningEle = representativeTbodyEle.getElementsByClassName("is-empty-warning");
            if (emptyWarningEle.length > 0) {
              emptyWarningEle[0].remove();
            }

            // create row
            insertRepresentativeRowFn(responseJSON.organizationRepresentative);
            window.llm.hideModal(addRepresentativeModalEle);
          }
        });
    });

    addRepresentativeModalEle.getElementsByClassName("is-copy-organization-address-button")[0].addEventListener("click", function(clickEvent) {
      clickEvent.preventDefault();

      document.getElementById("addOrganizationRepresentative--representativeAddress1").value = document.getElementById("organization--organizationAddress1").value;
      document.getElementById("addOrganizationRepresentative--representativeAddress2").value = document.getElementById("organization--organizationAddress2").value;
      document.getElementById("addOrganizationRepresentative--representativeCity").value = document.getElementById("organization--organizationCity").value;
      document.getElementById("addOrganizationRepresentative--representativeProvince").value = document.getElementById("organization--organizationProvince").value;
      document.getElementById("addOrganizationRepresentative--representativePostalCode").value = document.getElementById("organization--organizationPostalCode").value;
    });
  }


  // Nav blocker

  function setUnsavedChanges() {
    window.llm.enableNavBlocker();

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";
  }

  const inputEles = formEle.querySelectorAll("input, select, textarea");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
    inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
  }
}());
