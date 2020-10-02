import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type { llmGlobal } from "./types";
import type * as llmTypes from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;
declare const llm: llmGlobal;


(() => {

  const formEle = document.getElementById("form--organization") as HTMLFormElement;
  const formMessageEle = document.getElementById("container--form-message");

  const organizationIDString =
    (document.getElementById("organization--organizationID") as HTMLInputElement).value;

  const isCreate = organizationIDString === "";

  const organizationID = (organizationIDString === "" ? null : parseInt(organizationIDString, 10));

  // Main record update

  formEle.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(
      "/organizations/doSave",
      formEle,
      (responseJSON: { success: boolean; organizationID?: number; message?: string }) => {

        if (responseJSON.success) {
          cityssm.disableNavBlocker();
        }

        if (responseJSON.success && isCreate) {

          window.location.href = "/organizations/" + responseJSON.organizationID.toString() + "/edit";

        } else {

          formMessageEle.innerHTML = "";

          cityssm.alertModal(
            responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger"
          );

        }

      }
    );

  });


  if (!isCreate) {

    const deleteOrganizationFn = () => {

      cityssm.postJSON(
        "/organizations/doDelete", {
          organizationID
        },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.href = "/organizations";
          }
        }
      );

    };

    formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", () => {

      cityssm.confirmModal(
        "Delete Organization?",
        ("Are you sure you want to delete this organization?<br />" +
          "Note that any active licences issued to this organization will remain active."),
        "Yes, Delete Organization",
        "warning",
        deleteOrganizationFn
      );

    });

    formEle.getElementsByClassName("is-rollforward-button")[0].addEventListener("click", () => {

      let rollForwardCloseModalFn: () => void;
      let formEle: HTMLFormElement;
      let isSubmitting = false;

      const submitFn = (formEvent: Event) => {

        formEvent.preventDefault();

        if (isSubmitting) {
          return;
        }

        isSubmitting = true;

        cityssm.postJSON(
          "/organizations/doRollForward", formEle,
          (responseJSON: { success: boolean; message?: string }) => {

            if (responseJSON.success) {

              window.location.reload();

            } else {

              isSubmitting = false;
              rollForwardCloseModalFn();
              cityssm.alertModal("Roll Forward Failed",
                responseJSON.message,
                "OK",
                "danger");
            }
          });
      };

      cityssm.openHtmlModal("organization-rollforward", {
        onshown: (_modalEle, closeModalFn) => {

          rollForwardCloseModalFn = closeModalFn;

          (document.getElementById("rollforward--organizationID") as HTMLInputElement).value =
            organizationIDString;

          formEle = (document.getElementById("form--rollforward") as HTMLFormElement);
          formEle.addEventListener("submit", submitFn);
        }
      });
    });

    /*
     * Representatives
     */

    const representativeTbodyEle =
      document.getElementsByClassName("is-representative-table")[0].getElementsByTagName("tbody")[0];

    const showNoRepresentativesWarning = () => {

      if (representativeTbodyEle.getElementsByTagName("tr").length === 0) {

        representativeTbodyEle.innerHTML = "<tr class=\"has-background-warning is-empty-warning\">" +
          "<td class=\"has-text-centered\" colspan=\"6\">" +
          "<strong>There are no representatives associated with this organization.</strong>" +
          "</td>" +
          "</tr>";

      }
    };

    showNoRepresentativesWarning();

    // Default toggle

    const updateDefaultRepresentativeFn = (changeEvent: Event) => {

      const defaultRepresentativeIndex = (changeEvent.currentTarget as HTMLInputElement).value;

      cityssm.postJSON(
        "/organizations/" + organizationIDString + "/doSetDefaultRepresentative", {
          isDefaultRepresentativeIndex: defaultRepresentativeIndex
        },
        () => { }
      );

    };

    const radioEles = representativeTbodyEle.getElementsByTagName("input");

    for (const radioEle of radioEles) {
      radioEle.addEventListener("change", updateDefaultRepresentativeFn);
    }

    // Delete


    /**
     * @param  {MouseEvent} clickEvent
     */
    const deleteRepresentativeFn = (clickEvent: Event) => {

      clickEvent.preventDefault();

      const trEle = (clickEvent.currentTarget as HTMLButtonElement).closest("tr");

      const representativeName = trEle.getAttribute("data-representative-name");

      cityssm.confirmModal(
        "Delete a Representative?",
        `<p>Are you sure you want to delete the representative "${cityssm.escapeHTML(representativeName)}"?</p>`,
        "Yes, Delete",
        "danger",
        () => {

          cityssm.postJSON(
            "/organizations/" + organizationIDString + "/doDeleteOrganizationRepresentative", {
              representativeIndex: trEle.getAttribute("data-representative-index")
            },
            (responseJSON: { success: boolean }) => {

              if (responseJSON.success) {
                trEle.remove();
                showNoRepresentativesWarning();
              }
            }
          );
        }
      );

    };

    const deleteBtnEles = representativeTbodyEle.getElementsByClassName("is-delete-representative-button");

    for (const deleteBtnEle of deleteBtnEles) {
      deleteBtnEle.addEventListener("click", deleteRepresentativeFn);
    }

    // Add / edit

    const editRepresentativeModalEle =
      document.getElementsByClassName("is-edit-representative-modal")[0] as HTMLElement;

    const editRepresentativeFormEle = editRepresentativeModalEle.getElementsByTagName("form")[0];

    let editRepresentativeTrEle: HTMLTableRowElement;

    const openEditRepresentativeModalFn = (clickEvent: Event) => {

      editRepresentativeTrEle = (clickEvent.currentTarget as HTMLButtonElement).closest("tr");

      const representativeIndex = editRepresentativeTrEle.getAttribute("data-representative-index");

      (document.getElementById("editOrganizationRepresentative--representativeIndex") as HTMLInputElement)
        .value = representativeIndex;

      (document.getElementById("editOrganizationRepresentative--representativeName") as HTMLInputElement
      ).value = editRepresentativeTrEle.getAttribute("data-representative-name");

      (document.getElementById("editOrganizationRepresentative--representativeTitle") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-title");

      (document.getElementById("editOrganizationRepresentative--representativeAddress1") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-address-1");

      (document.getElementById("editOrganizationRepresentative--representativeAddress2") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-address-2");

      (document.getElementById("editOrganizationRepresentative--representativeCity") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-city");

      (document.getElementById("editOrganizationRepresentative--representativeProvince") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-province");

      (document.getElementById("editOrganizationRepresentative--representativePostalCode") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-postal-code");

      (document.getElementById("editOrganizationRepresentative--representativePhoneNumber") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-phone-number");

      (document.getElementById("editOrganizationRepresentative--representativeEmailAddress") as HTMLInputElement)
        .value = editRepresentativeTrEle.getAttribute("data-representative-email-address");

      (document.getElementById("editOrganizationRepresentative--isDefault") as HTMLInputElement).value =
        (document.getElementById("representative-isDefault--" + representativeIndex) as HTMLInputElement).checked
          ? "1"
          : "0";

      cityssm.showModal(editRepresentativeModalEle);

    };

    const insertRepresentativeRowFn = (representativeObj: llmTypes.OrganizationRepresentative) => {

      const trEle = document.createElement("tr");

      trEle.setAttribute("data-representative-index", representativeObj.representativeIndex.toString());
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
        "<input class=\"is-checkradio is-info\"" +
        " id=\"representative-isDefault--" + representativeObj.representativeIndex.toString() + "\"" +
        " name=\"representative-isDefault\" type=\"radio\"" +
        (representativeObj.isDefault ? " checked" : "") + " />&nbsp;" +
        "<label for=\"representative-isDefault--" + representativeObj.representativeIndex.toString() + "\"></label>" +
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
        ("<button class=\"button is-small is-edit-representative-button\"" +
          " data-tooltip=\"Edit Representative\" type=\"button\">" +
          "<span class=\"icon\"><i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i></span>" +
          "<span>Edit</span></button>") +
        ("<button class=\"button is-small has-text-danger is-delete-representative-button\"" +
          " data-tooltip=\"Delete Representative\" type=\"button\">" +
          "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
          "<span class=\"sr-only\">Delete</span>" +
          "</button>") +

        "</td>");

      trEle.getElementsByClassName("is-edit-representative-button")[0]
        .addEventListener("click", openEditRepresentativeModalFn);

      trEle.getElementsByClassName("is-delete-representative-button")[0]
        .addEventListener("click", deleteRepresentativeFn);

      representativeTbodyEle.insertAdjacentElement("beforeend", trEle);

    };

    // Edit

    const editBtnEles = representativeTbodyEle.getElementsByClassName("is-edit-representative-button");

    for (const editBtnEle of editBtnEles) {
      editBtnEle.addEventListener("click", openEditRepresentativeModalFn);
    }

    // Close edit
    let cancelButtonEles = editRepresentativeModalEle.getElementsByClassName("is-cancel-button");

    for (const cancelButtonEle of cancelButtonEles) {
      cancelButtonEle.addEventListener("click", cityssm.hideModal);
    }

    editRepresentativeFormEle.addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/organizations/" + organizationIDString + "/doEditOrganizationRepresentative",
        formEvent.currentTarget,
        (responseJSON) => {

          if (responseJSON.success) {

            editRepresentativeTrEle.remove();
            editRepresentativeTrEle = null;

            // Create row

            insertRepresentativeRowFn(responseJSON.organizationRepresentative);
            cityssm.hideModal(editRepresentativeModalEle);
          }
        }
      );
    });

    // Add

    const addRepresentativeModalEle = document.getElementsByClassName("is-add-representative-modal")[0] as HTMLElement;
    const addRepresentativeFormEle = addRepresentativeModalEle.getElementsByTagName("form")[0];

    // Open add
    document.getElementsByClassName("is-add-representative-button")[0].addEventListener("click", () => {

      addRepresentativeFormEle.reset();
      cityssm.showModal(addRepresentativeModalEle);
      document.getElementById("addOrganizationRepresentative--representativeName").focus();

    });

    // Close add
    cancelButtonEles = addRepresentativeModalEle.getElementsByClassName("is-cancel-button");

    for (const cancelButtonEle of cancelButtonEles) {
      cancelButtonEle.addEventListener("click", cityssm.hideModal);
    }

    addRepresentativeFormEle.addEventListener("submit", (formEvent) => {

      formEvent.preventDefault();

      cityssm.postJSON(
        "/organizations/" + organizationIDString + "/doAddOrganizationRepresentative",
        formEvent.currentTarget,
        (responseJSON: { success: boolean; organizationRepresentative: llmTypes.OrganizationRepresentative }) => {

          if (responseJSON.success) {

            // Remove empty warning

            const emptyWarningEle = representativeTbodyEle.getElementsByClassName("is-empty-warning");
            if (emptyWarningEle.length > 0) {

              emptyWarningEle[0].remove();

            }

            // Create row

            insertRepresentativeRowFn(responseJSON.organizationRepresentative);
            cityssm.hideModal(addRepresentativeModalEle);
          }
        }
      );

    });

    addRepresentativeModalEle.getElementsByClassName("is-copy-organization-address-button")[0]
      .addEventListener("click", (clickEvent) => {

        clickEvent.preventDefault();

        (document.getElementById("addOrganizationRepresentative--representativeAddress1") as HTMLInputElement).value =
          (document.getElementById("organization--organizationAddress1") as HTMLInputElement).value;

        (document.getElementById("addOrganizationRepresentative--representativeAddress2") as HTMLInputElement).value =
          (document.getElementById("organization--organizationAddress2") as HTMLInputElement).value;

        (document.getElementById("addOrganizationRepresentative--representativeCity") as HTMLInputElement).value =
          (document.getElementById("organization--organizationCity") as HTMLInputElement).value;

        (document.getElementById("addOrganizationRepresentative--representativeProvince") as HTMLInputElement).value =
          (document.getElementById("organization--organizationProvince") as HTMLInputElement).value;

        (document.getElementById("addOrganizationRepresentative--representativePostalCode") as HTMLInputElement).value =
          (document.getElementById("organization--organizationPostalCode") as HTMLInputElement).value;

      });


    /*
     * Reminders
     */


    const deleteReminderClickFn = (buttonEvent: Event) => {
      buttonEvent.preventDefault();

      const buttonEle = buttonEvent.currentTarget as HTMLButtonElement;

      const reminderIndex = parseInt(buttonEle.getAttribute("data-reminder-index"), 10);

      llm.organizationReminders.deleteReminder(organizationID, reminderIndex, true, (responseJSON) => {

        if (responseJSON.success) {
          buttonEle.closest("tr").remove();
        }
      });
    };

    const dismissReminderClickFn = (buttonEvent: Event) => {
      buttonEvent.preventDefault();

      const buttonEle = buttonEvent.currentTarget as HTMLButtonElement;

      const reminderIndex = parseInt(buttonEle.getAttribute("data-reminder-index"), 10);

      llm.organizationReminders.dismissReminder(organizationID, reminderIndex, true, (responseJSON) => {

        if (responseJSON.success) {

          llm.organizationReminders.loadReminderTypeCache(() => {

            const oldTrEle = buttonEle.closest("tr");

            const newTrEle = renderReminderAsTableRow(responseJSON.reminder);

            oldTrEle.insertAdjacentElement("afterend", newTrEle);

            oldTrEle.remove();
          });
        }
      });
    };

    const editReminderClickFn = (buttonEvent: Event) => {
      buttonEvent.preventDefault();

      const buttonEle = buttonEvent.currentTarget as HTMLButtonElement;

      const reminderIndex = parseInt(buttonEle.getAttribute("data-reminder-index"), 10);

      llm.organizationReminders.openEditReminderModal(organizationID, reminderIndex, (reminderObj) => {

        const oldTrEle = buttonEle.closest("tr");

        const newTrEle = renderReminderAsTableRow(reminderObj);

        oldTrEle.insertAdjacentElement("afterend", newTrEle);

        oldTrEle.remove();
      });
    };

    const renderReminderAsTableRow = (reminder: llmTypes.OrganizationReminder) => {

      const reminderType = llm.organizationReminders.getReminderType(reminder.reminderTypeKey);

      const trEle = document.createElement("tr");

      let reminderDateInnerHTML = "";

      if (reminder.reminderDateString === "") {

        reminderDateInnerHTML = "<span class=\"has-text-grey\">(No Reminder Set)</span>";

      } else if (reminder.dismissedDateString !== "") {

        reminderDateInnerHTML = "<span class=\"has-text-grey is-linethrough\">" +
          reminder.reminderDateString +
          "</span>";

      } else {
        reminderDateInnerHTML = reminder.reminderDateString;
      }

      trEle.innerHTML = ("<td>" +
        (reminderType
          ? reminderType.reminderType + "<br />" +
          "<span class=\"is-size-7\">" + reminderType.reminderCategory + "</span>"
          : reminder.reminderTypeKey) +
        "</td>") +
        "<td>" + (reminder.reminderStatus || "") + "</td>" +
        ("<td class=\"has-text-centered\">" +
          (reminder.dismissedDateString === ""
            ? "<span class=\"has-text-grey\">(Active)</span><br />" +
            "<button class=\"button is-small is-light is-success is-dismiss-reminder-button mt-1\" data-reminder-index=\"" + reminder.reminderIndex.toString() + "\">" +
            "<span class=\"icon is-small\"><i class=\"fas fa-check\" aria-hidden=\"true\"></i></span>" +
            "<span>Dismiss</span>" +
            "</button>"
            : reminder.dismissedDateString) +
          "</td>") +
        ("<td class=\"has-text-centered\">" +
          reminderDateInnerHTML +
          "</td>") +
        ("<td class=\"is-hidden-print\">" +
          "<div class=\"buttons is-right has-addons is-hidden-status-view\">" +
          ("<button class=\"button is-small is-edit-reminder-button\"" +
            " data-reminder-index=\"" + reminder.reminderIndex.toString() + "\"" +
            " data-tooltip=\"Edit Reminder\" type=\"button\">" +
            "<span class=\"icon is-small\">" +
            "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "<span>Edit</span>" +
            "</button>") +
          ("<button class=\"button is-small has-text-danger is-delete-reminder-button\"" +
            " data-reminder-index=\"" + reminder.reminderIndex.toString() + "\"" +
            " data-tooltip=\"Delete Reminder\" type=\"button\">" +
            "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
            "<span class=\"sr-only\">Delete</span>" +
            "</button>") +
          "</div>" +
          "</td>");

      if (reminder.dismissedDateString === "") {
        trEle.getElementsByClassName("is-dismiss-reminder-button")[0].addEventListener("click",
          dismissReminderClickFn);
      }

      trEle.getElementsByClassName("is-edit-reminder-button")[0].addEventListener("click",
        editReminderClickFn);

      trEle.getElementsByClassName("is-delete-reminder-button")[0].addEventListener("click",
        deleteReminderClickFn);

      return trEle;
    };


    document.getElementById("is-add-reminder-button").addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();
      llm.organizationReminders.openAddReminderModal(organizationID, (reminderObj) => {

        const trEle = renderReminderAsTableRow(reminderObj);

        document.getElementById("container--reminders").insertAdjacentElement("afterbegin", trEle);
      });
    });

    const dismissReminderButtonEles = document.getElementsByClassName("is-dismiss-reminder-button");

    for (const buttonEle of dismissReminderButtonEles) {
      buttonEle.addEventListener("click", dismissReminderClickFn);
    }

    const editReminderButtonEles = document.getElementsByClassName("is-edit-reminder-button");

    for (const buttonEle of editReminderButtonEles) {
      buttonEle.addEventListener("click", editReminderClickFn);
    }

    const deleteReminderButtonEles = document.getElementsByClassName("is-delete-reminder-button");

    for (const buttonEle of deleteReminderButtonEles) {
      buttonEle.addEventListener("click", deleteReminderClickFn);
    }
  }


  // Nav blocker

  const setUnsavedChangesFn = () => {

    cityssm.enableNavBlocker();

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

  };

  const inputEles = formEle.querySelectorAll("input, select, textarea");

  for (const inputEle of inputEles) {
    inputEle.addEventListener("change", setUnsavedChangesFn);
  }

})();
