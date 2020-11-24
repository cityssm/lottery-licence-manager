import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  const formEle = document.getElementById("form--location") as HTMLFormElement;
  const formMessageEle = document.getElementById("container--form-message");
  const locationID = (document.getElementById("location--locationID") as HTMLInputElement).value;

  let hasUnsavedChanges = false;

  const isCreate = locationID === "";
  const isAdmin = (document.getElementsByTagName("main")[0].getAttribute("data-is-admin") === "true");

  formEle.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + (isCreate ? "/locations/doCreate" : "/locations/doUpdate"),
      formEle,
      (responseJSON: { success: boolean; message?: string; locationID?: number }) => {

        if (responseJSON.success) {

          hasUnsavedChanges = false;
          cityssm.disableNavBlocker();
        }

        if (responseJSON.success && isCreate) {

          window.location.href = "/locations/" + responseJSON.locationID.toString() + "/edit";

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

    const deleteLocationFn = () => {

      cityssm.postJSON(urlPrefix + "/locations/doDelete", {
        locationID
      },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.href = "/locations";
          }
        }
      );
    };

    formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete Location?",
        ("Are you sure you want to delete this location?<br />" +
          "Note that any active licences associated with this location will remain active."),
        "Yes, Delete Location",
        "warning",
        deleteLocationFn
      );
    });
  }


  if (!isCreate && isAdmin) {

    const intLocationID = parseInt(locationID, 10);

    formEle.getElementsByClassName("is-merge-button")[0].addEventListener("click", (mergeButton_clickEvent) => {

      mergeButton_clickEvent.preventDefault();

      if (hasUnsavedChanges) {

        cityssm.alertModal(
          "Unsaved Changes",
          "You must save all unsaved changes before merging this location record.",
          "OK",
          "warning"
        );
        return;
      }

      // get location display name

      const locationName_target = (document.getElementById("location--locationName") as HTMLInputElement).value;

      const locationDisplayNameAndID_target = (locationName_target === ""
        ? (document.getElementById("location--locationAddress1") as HTMLInputElement).value
        : locationName_target) +
        ", #" + locationID;

      // init variables for modal

      let locationID_source = "";

      let locationsList: llmTypes.Location[] = [];
      let locationFilterEle = null;
      let sourceLocationsContainerEle = null;
      let closeMergeLocationModalFn = null;

      const doMergeFn = () => {

        cityssm.postJSON(urlPrefix + "/locations/doMerge", {
          targetLocationID: locationID,
          sourceLocationID: locationID_source
        },
          (responseJSON: { success: boolean }) => {

            if (responseJSON.success) {
              window.location.reload();

            } else {
              cityssm.alertModal("Merge Not Completed", "Please try again.", "OK", "danger");
            }
          }
        );
      };

      const clickFn_selectSourceLocation = (clickEvent: Event) => {

        clickEvent.preventDefault();

        const sourceLocationLinkEle = clickEvent.currentTarget as HTMLAnchorElement;

        locationID_source = sourceLocationLinkEle.getAttribute("data-location-id");
        const locationDisplayName_source = sourceLocationLinkEle.getAttribute("data-location-display-name");

        closeMergeLocationModalFn();

        cityssm.confirmModal(
          "Confirm Merge",
          "Are you sure you want to update all licences associated with" +
          " <em>" + locationDisplayName_source + ", #" + locationID_source + "</em>" +
          " and associate them with" +
          " <em>" + locationDisplayNameAndID_target + "</em>?",
          "Yes, Complete Merge", "warning",
          doMergeFn
        );

      };

      const filterLocationsFn = () => {

        const filterSplit = locationFilterEle.value
          .trim()
          .toLowerCase()
          .split(" ");

        const listEle = document.createElement("div");
        listEle.className = "panel";

        for (const locationObj of locationsList) {

          if (locationObj.locationID === intLocationID) {
            continue;
          }

          let showLocation = true;

          for (const filterString of filterSplit) {

            if (!locationObj.locationName.toLowerCase().includes(filterString)) {
              showLocation = false;
              break;
            }
          }

          if (!showLocation) {
            continue;
          }

          const listItemEle = document.createElement("a");
          listItemEle.className = "panel-block is-block";
          listItemEle.setAttribute("data-location-id", locationObj.locationID.toString());
          listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
          listItemEle.addEventListener("click", clickFn_selectSourceLocation);

          listItemEle.innerHTML = "<div class=\"level is-marginless\">" +
            ("<div class=\"level-left\">" +
              "<div>" +
              cityssm.escapeHTML(locationObj.locationDisplayName) + "<br />" +
              "<small>" +
              cityssm.escapeHTML(locationObj.locationAddress1) +
              "</small>" +
              "</div>" +
              "</div>") +
            ("<div class=\"level-right\">" +
              "#" + locationObj.locationID.toString() +
              "</div>") +
            "</div>" +
            "<div class=\"has-text-right\">" +
            (locationObj.licences_count > 0
              ? " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Licence Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObj.licences_count.toString() + "</span></span>"
              : "") +
            (locationObj.distributor_count > 0
              ? " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Distributor Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-truck-moving\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObj.distributor_count.toString() + "</span></span>"
              : "") +
            (locationObj.manufacturer_count > 0
              ? " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Manufacturer Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-print\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObj.manufacturer_count.toString() + "</span></span>"
              : "") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", listItemEle);
        }

        cityssm.clearElement(sourceLocationsContainerEle);
        sourceLocationsContainerEle.insertAdjacentElement("beforeend", listEle);
      };

      cityssm.openHtmlModal("locationMerge", {
        onshow(modalEle: HTMLElement): void {

          // Location name - target

          const locationDisplayNameAndID_target_eles =
            modalEle.getElementsByClassName("mergeLocation--locationDisplayNameAndID_target") as
            HTMLCollectionOf<HTMLSpanElement>;

          for (const locationDisplayNameAndID_target_ele of locationDisplayNameAndID_target_eles) {
            locationDisplayNameAndID_target_ele.innerText = locationDisplayNameAndID_target;
          }

          // Locations - source

          sourceLocationsContainerEle = document.getElementById("container--sourceLocations");

          locationFilterEle = document.getElementById("mergeLocation--locationFilter");
          locationFilterEle.addEventListener("keyup", filterLocationsFn);

        },
        onshown(_modalEle: HTMLElement, closeModalFn: () => void): void {

          closeMergeLocationModalFn = closeModalFn;

          cityssm.postJSON(urlPrefix + "/locations/doGetLocations", {
            limit: -1
          },
            (responseJSON) => {

              locationsList = responseJSON.locations;

              locationFilterEle.removeAttribute("disabled");
              locationFilterEle.focus();

              filterLocationsFn();
            }
          );
        }
      });
    });
  }


  // Nav blocker

  const setUnsavedChangesFn = () => {

    hasUnsavedChanges = true;

    cityssm.enableNavBlocker();

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

  };

  const inputEles = formEle.getElementsByTagName("input");

  for (const inputEle of inputEles) {
    inputEle.addEventListener("change", setUnsavedChangesFn);
  }

  const locationNameEle = document.getElementById("location--locationName");

  if (isCreate) {
    locationNameEle.focus();
  }

  // Location Name is required for manufacturers and distributors

  const locationIsDistributorCheckboxEle =
    document.getElementById("location--locationIsDistributor") as HTMLInputElement;

  const locationIsManufacturerCheckboxEle =
    document.getElementById("location--locationIsManufacturer") as HTMLInputElement;

  const setLocationNameRequiredFn = () => {

    if (locationIsDistributorCheckboxEle.checked || locationIsManufacturerCheckboxEle.checked) {
      locationNameEle.setAttribute("required", "required");

    } else {
      locationNameEle.removeAttribute("required");
    }
  };

  locationIsDistributorCheckboxEle.addEventListener("change", setLocationNameRequiredFn);
  locationIsManufacturerCheckboxEle.addEventListener("change", setLocationNameRequiredFn);
})();
