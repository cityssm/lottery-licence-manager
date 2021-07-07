/* eslint-disable unicorn/filename-case */

import type { cityssmGlobal } from "@cityssm/bulma-webapp-js/src/types";
import type * as llmTypes from "../types/recordTypes";

declare const cityssm: cityssmGlobal;


(() => {

  const urlPrefix = document.querySelector("main").dataset.urlPrefix;

  const formElement = document.querySelector("#form--location") as HTMLFormElement;
  const formMessageElement = document.querySelector("#container--form-message");
  const locationID = (document.querySelector("#location--locationID") as HTMLInputElement).value;

  let hasUnsavedChanges = false;

  const isCreate = locationID === "";
  const isAdmin = (document.querySelector("main").dataset.isAdmin === "true");

  formElement.addEventListener("submit", (formEvent) => {

    formEvent.preventDefault();

    formMessageElement.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    cityssm.postJSON(urlPrefix + (isCreate ? "/locations/doCreate" : "/locations/doUpdate"),
      formElement,
      (responseJSON: { success: boolean; message?: string; locationID?: number }) => {

        if (responseJSON.success) {

          hasUnsavedChanges = false;
          cityssm.disableNavBlocker();
        }

        if (responseJSON.success && isCreate) {

          window.location.href = urlPrefix + "/locations/" + responseJSON.locationID.toString() + "/edit";

        } else {

          formMessageElement.innerHTML = "";

          cityssm.alertModal(
            responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger"
          );
        }
      }
    );

  });


  if (!isCreate) {

    const deleteLocationFunction = () => {

      cityssm.postJSON(urlPrefix + "/locations/doDelete", {
        locationID
      },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {
            window.location.href = urlPrefix + "/locations";
          }
        }
      );
    };

    formElement.querySelector(".is-delete-button").addEventListener("click", (clickEvent) => {

      clickEvent.preventDefault();

      cityssm.confirmModal(
        "Delete Location?",
        ("Are you sure you want to delete this location?<br />" +
          "Note that any active licences associated with this location will remain active."),
        "Yes, Delete Location",
        "warning",
        deleteLocationFunction
      );
    });
  }


  if (!isCreate && isAdmin) {

    const intLocationID = Number.parseInt(locationID, 10);

    formElement.querySelector(".is-merge-button").addEventListener("click", (mergeButton_clickEvent) => {

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

      const locationName_target = (document.querySelector("#location--locationName") as HTMLInputElement).value;

      const locationDisplayNameAndID_target = (locationName_target === ""
        ? (document.querySelector("#location--locationAddress1") as HTMLInputElement).value
        : locationName_target) +
        ", #" + locationID;

      // init variables for modal

      let locationID_source = "";

      let locationsList: llmTypes.Location[] = [];
      let locationFilterElement: HTMLInputElement;
      let sourceLocationsContainerElement: HTMLElement;
      let closeMergeLocationModalFunction: () => void;

      const doMergeFunction = () => {

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

      const clickFunction_selectSourceLocation = (clickEvent: Event) => {

        clickEvent.preventDefault();

        const sourceLocationLinkElement = clickEvent.currentTarget as HTMLAnchorElement;

        locationID_source = sourceLocationLinkElement.getAttribute("data-location-id");
        const locationDisplayName_source = sourceLocationLinkElement.getAttribute("data-location-display-name");

        closeMergeLocationModalFunction();

        cityssm.confirmModal(
          "Confirm Merge",
          ("Are you sure you want to update all licences associated with" +
            " <em>" + locationDisplayName_source + ", #" + locationID_source + "</em>" +
            " and associate them with" +
            " <em>" + locationDisplayNameAndID_target + "</em>?"),
          "Yes, Complete Merge", "warning",
          doMergeFunction
        );

      };

      const filterLocationsFunction = () => {

        const filterSplit = locationFilterElement.value
          .trim()
          .toLowerCase()
          .split(" ");

        const listElement = document.createElement("div");
        listElement.className = "panel";

        for (const locationObject of locationsList) {

          if (locationObject.locationID === intLocationID) {
            continue;
          }

          let showLocation = true;

          for (const filterString of filterSplit) {

            if (!locationObject.locationName.toLowerCase().includes(filterString)) {
              showLocation = false;
              break;
            }
          }

          if (!showLocation) {
            continue;
          }

          const listItemElement = document.createElement("a");
          listItemElement.className = "panel-block is-block";
          listItemElement.dataset.locationId = locationObject.locationID.toString();
          listItemElement.dataset.locationDisplayName = locationObject.locationDisplayName;
          listItemElement.addEventListener("click", clickFunction_selectSourceLocation);

          listItemElement.innerHTML = "<div class=\"level is-marginless\">" +
            ("<div class=\"level-left\">" +
              "<div>" +
              cityssm.escapeHTML(locationObject.locationDisplayName) + "<br />" +
              "<small>" +
              cityssm.escapeHTML(locationObject.locationAddress1) +
              "</small>" +
              "</div>" +
              "</div>") +
            ("<div class=\"level-right\">" +
              "#" + locationObject.locationID.toString() +
              "</div>") +
            "</div>" +
            "<div class=\"has-text-right\">" +
            (locationObject.licences_count > 0
              ? " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Licence Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObject.licences_count.toString() + "</span></span>"
              : "") +
            (locationObject.distributor_count > 0
              ? " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Distributor Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-truck-moving\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObject.distributor_count.toString() + "</span></span>"
              : "") +
            (locationObject.manufacturer_count > 0
              ? " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Manufacturer Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-print\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObject
              : "") +
            "</div>";

          listElement.append(listItemElement);
        }

        cityssm.clearElement(sourceLocationsContainerElement);
        sourceLocationsContainerElement.append(listElement);
      };

      cityssm.openHtmlModal("locationMerge", {
        onshow(modalElement) {

          // Location name - target

          const locationDisplayNameAndID_target_elements =
            modalElement.querySelectorAll(".mergeLocation--locationDisplayNameAndID_target") as
            NodeListOf<HTMLSpanElement>;

          for (const locationDisplayNameAndID_target_element of locationDisplayNameAndID_target_elements) {
            locationDisplayNameAndID_target_element.textContent = locationDisplayNameAndID_target;
          }

          // Locations - source

          sourceLocationsContainerElement = document.querySelector("#container--sourceLocations");

          locationFilterElement = document.querySelector("#mergeLocation--locationFilter");
          locationFilterElement.addEventListener("keyup", filterLocationsFunction);

        },
        onshown(_modalElement, closeModalFunction) {

          closeMergeLocationModalFunction = closeModalFunction;

          cityssm.postJSON(urlPrefix + "/locations/doGetLocations", {
            limit: -1
          },
            (responseJSON: { locations: llmTypes.Location[] }) => {

              locationsList = responseJSON.locations;

              locationFilterElement.removeAttribute("disabled");
              locationFilterElement.focus();

              filterLocationsFunction();
            }
          );
        }
      });
    });
  }


  // Nav blocker

  const setUnsavedChangesFunction = () => {

    hasUnsavedChanges = true;

    cityssm.enableNavBlocker();

    formMessageElement.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

  };

  const inputElements = formElement.querySelectorAll("input");

  for (const inputElement of inputElements) {
    inputElement.addEventListener("change", setUnsavedChangesFunction);
  }

  const locationNameElement = document.querySelector("#location--locationName") as HTMLInputElement;

  if (isCreate) {
    locationNameElement.focus();
  }

  // Location Name is required for manufacturers and distributors

  const locationIsDistributorCheckboxElement =
    document.querySelector("#location--locationIsDistributor") as HTMLInputElement;

  const locationIsManufacturerCheckboxElement =
    document.querySelector("#location--locationIsManufacturer") as HTMLInputElement;

  const setLocationNameRequiredFunction = () => {

    if (locationIsDistributorCheckboxElement.checked || locationIsManufacturerCheckboxElement.checked) {
      locationNameElement.setAttribute("required", "required");

    } else {
      locationNameElement.removeAttribute("required");
    }
  };

  locationIsDistributorCheckboxElement.addEventListener("change", setLocationNameRequiredFunction);
  locationIsManufacturerCheckboxElement.addEventListener("change", setLocationNameRequiredFunction);
})();
