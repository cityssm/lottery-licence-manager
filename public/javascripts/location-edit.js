"use strict";

(function() {

  const formEle = document.getElementById("form--location");
  const formMessageEle = document.getElementById("container--form-message");
  const locationID = document.getElementById("location--locationID").value;

  let hasUnsavedChanges = false;

  const isCreate = locationID === "";
  const isAdmin = (document.getElementsByTagName("main")[0].getAttribute("data-is-admin") === "true");

  formEle.addEventListener("submit", function(formEvent) {

    formEvent.preventDefault();

    formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";

    llm.postJSON(
      (isCreate ? "/locations/doCreate" : "/locations/doUpdate"),
      formEle,
      function(responseJSON) {

        if (responseJSON.success) {

          hasUnsavedChanges = false;
          llm.disableNavBlocker();

        }

        if (responseJSON.success && isCreate) {

          window.location.href = "/locations/" + responseJSON.locationID + "/edit";

        } else {

          formMessageEle.innerHTML = "";

          llm.alertModal(
            responseJSON.message, "", "OK",
            responseJSON.success ? "success" : "danger"
          );

        }

      }
    );

  });


  if (!isCreate) {

    const deleteLocationFn = function() {

      llm.postJSON(
        "/locations/doDelete", {
          locationID: locationID
        },
        function(responseJSON) {

          if (responseJSON.success) {

            window.location.href = "/locations";

          }

        }
      );

    };

    formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", function(clickEvent) {

      clickEvent.preventDefault();

      llm.confirmModal(
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

    const intLocationID = parseInt(locationID);

    formEle.getElementsByClassName("is-merge-button")[0].addEventListener("click", function(mergeButton_clickEvent) {

      mergeButton_clickEvent.preventDefault();

      if (hasUnsavedChanges) {

        llm.alertModal(
          "Unsaved Changes",
          "You must save all unsaved changes before merging this location record.",
          "OK",
          "warning"
        );
        return;

      }

      // get location display name

      const locationName_target = document.getElementById("location--locationName").value;

      const locationDisplayNameAndID_target = (locationName_target === "" ? document.getElementById("location--locationAddress1").value : locationName_target) +
        ", #" + locationID;

      // init variables for modal

      let locationID_source = "";

      let locationsList = [];
      let locationFilterEle = null;
      let sourceLocationsContainerEle = null;
      let closeMergeLocationModalFn = null;

      const doMerge = function() {

        llm.postJSON(
          "/locations/doMerge", {
            targetLocationID: locationID,
            sourceLocationID: locationID_source
          },
          function(responseJSON) {

            if (responseJSON.success) {

              window.location.reload(true);

            } else {

              llm.alertModal("Merge Not Completed", "Please try again.", "OK", "danger");

            }

          }
        );

      };

      const clickFn_selectSourceLocation = function(clickEvent) {

        clickEvent.preventDefault();

        locationID_source = clickEvent.currentTarget.getAttribute("data-location-id");
        const locationDisplayName_source = clickEvent.currentTarget.getAttribute("data-location-display-name");

        closeMergeLocationModalFn();

        llm.confirmModal(
          "Confirm Merge",
          "Are you sure you want to update all licences associated with" +
          " <em>" + locationDisplayName_source + ", #" + locationID_source + "</em>" +
          " and associate them with" +
          " <em>" + locationDisplayNameAndID_target + "</em>?",
          "Yes, Complete Merge", "warning",
          doMerge
        );

      };

      const filterLocationsFn = function() {

        const filterSplit = locationFilterEle.value
          .trim()
          .toLowerCase()
          .split(" ");

        const listEle = document.createElement("div");
        listEle.className = "list is-hoverable";

        for (let locationIndex = 0; locationIndex < locationsList.length; locationIndex += 1) {

          const locationObj = locationsList[locationIndex];

          if (locationObj.locationID === intLocationID) {

            continue;

          }

          let showLocation = true;

          for (let filterIndex = 0; filterIndex < filterSplit.length; filterIndex += 1) {

            const filterString = filterSplit[filterIndex];

            if (locationObj.locationName.toLowerCase().indexOf(filterString) === -1) {

              showLocation = false;
              break;

            }

          }

          if (!showLocation) {

            continue;

          }

          const listItemEle = document.createElement("a");
          listItemEle.className = "list-item";
          listItemEle.setAttribute("data-location-id", locationObj.locationID);
          listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
          listItemEle.addEventListener("click", clickFn_selectSourceLocation);

          listItemEle.innerHTML = "<div class=\"level is-marginless\">" +
            ("<div class=\"level-left\">" +
              "<div>" +
              llm.escapeHTML(locationObj.locationDisplayName) + "<br />" +
              "<small>" +
              llm.escapeHTML(locationObj.locationAddress1) +
              "</small>" +
              "</div>" +
              "</div>") +
            ("<div class=\"level-right\">" +
              "#" + locationObj.locationID +
              "</div>") +
            "</div>" +
            "<div class=\"has-text-right\">" +
            (locationObj.licences_count > 0 ?
              " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Licence Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-certificate\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObj.licences_count + "</span></span>" :
              "") +
            (locationObj.distributor_count > 0 ?
              " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Distributor Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-truck-moving\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObj.distributor_count + "</span></span>" :
              "") +
            (locationObj.manufacturer_count > 0 ?
              " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Manufacturer Count\">" +
              "<span class=\"icon\"><i class=\"fas fa-print\" aria-hidden=\"true\"></i></span>" +
              " <span>" + locationObj.manufacturer_count + "</span></span>" :
              "") +
            "</div>";

          listEle.insertAdjacentElement("beforeend", listItemEle);

        }

        llm.clearElement(sourceLocationsContainerEle);
        sourceLocationsContainerEle.insertAdjacentElement("beforeend", listEle);

      };

      llm.openHtmlModal("locationMerge", {
        onshow: function(modalEle) {

          // Location name - target

          const locationDisplayNameAndID_target_eles = modalEle.getElementsByClassName("mergeLocation--locationDisplayNameAndID_target");

          for (let index = 0; index < locationDisplayNameAndID_target_eles.length; index += 1) {

            locationDisplayNameAndID_target_eles[index].innerText = locationDisplayNameAndID_target;

          }

          // Locations - source

          sourceLocationsContainerEle = document.getElementById("container--sourceLocations");

          locationFilterEle = document.getElementById("mergeLocation--locationFilter");
          locationFilterEle.addEventListener("keyup", filterLocationsFn);

          llm.postJSON(
            "/locations/doGetLocations",
            null,
            function(responseJSON) {

              locationsList = responseJSON;
              locationFilterEle.removeAttribute("disabled");
              filterLocationsFn();

            }
          );

        },
        onshown: function(modalEle, closeModalFn) {

          closeMergeLocationModalFn = closeModalFn;

        }

      });

    });

  }


  // Nav blocker

  function setUnsavedChanges() {

    hasUnsavedChanges = true;

    llm.enableNavBlocker();

    formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
      "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
      " <span>Unsaved Changes</span>" +
      "</div>";

  }

  const inputEles = formEle.getElementsByTagName("input");

  for (let inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {

    inputEles[inputIndex].addEventListener("change", setUnsavedChanges);

  }

}());
