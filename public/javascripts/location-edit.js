"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var formEle = document.getElementById("form--location");
    var formMessageEle = document.getElementById("container--form-message");
    var locationID = document.getElementById("location--locationID").value;
    var hasUnsavedChanges = false;
    var isCreate = locationID === "";
    var isAdmin = (document.getElementsByTagName("main")[0].getAttribute("data-is-admin") === "true");
    formEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON((isCreate ? "/locations/doCreate" : "/locations/doUpdate"), formEle, function (responseJSON) {
            if (responseJSON.success) {
                hasUnsavedChanges = false;
                cityssm.disableNavBlocker();
            }
            if (responseJSON.success && isCreate) {
                window.location.href = "/locations/" + responseJSON.locationID + "/edit";
            }
            else {
                formMessageEle.innerHTML = "";
                cityssm.alertModal(responseJSON.message, "", "OK", responseJSON.success ? "success" : "danger");
            }
        });
    });
    if (!isCreate) {
        var deleteLocationFn_1 = function () {
            cityssm.postJSON("/locations/doDelete", {
                locationID: locationID
            }, function (responseJSON) {
                if (responseJSON.success) {
                    window.location.href = "/locations";
                }
            });
        };
        formEle.getElementsByClassName("is-delete-button")[0].addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            cityssm.confirmModal("Delete Location?", ("Are you sure you want to delete this location?<br />" +
                "Note that any active licences associated with this location will remain active."), "Yes, Delete Location", "warning", deleteLocationFn_1);
        });
    }
    if (!isCreate && isAdmin) {
        var intLocationID_1 = parseInt(locationID);
        formEle.getElementsByClassName("is-merge-button")[0].addEventListener("click", function (mergeButton_clickEvent) {
            mergeButton_clickEvent.preventDefault();
            if (hasUnsavedChanges) {
                cityssm.alertModal("Unsaved Changes", "You must save all unsaved changes before merging this location record.", "OK", "warning");
                return;
            }
            var locationName_target = document.getElementById("location--locationName").value;
            var locationDisplayNameAndID_target = (locationName_target === "" ?
                document.getElementById("location--locationAddress1").value :
                locationName_target) +
                ", #" + locationID;
            var locationID_source = "";
            var locationsList = [];
            var locationFilterEle = null;
            var sourceLocationsContainerEle = null;
            var closeMergeLocationModalFn = null;
            var doMerge = function () {
                cityssm.postJSON("/locations/doMerge", {
                    targetLocationID: locationID,
                    sourceLocationID: locationID_source
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.reload(true);
                    }
                    else {
                        cityssm.alertModal("Merge Not Completed", "Please try again.", "OK", "danger");
                    }
                });
            };
            var clickFn_selectSourceLocation = function (clickEvent) {
                clickEvent.preventDefault();
                var sourceLocationLinkEle = clickEvent.currentTarget;
                locationID_source = sourceLocationLinkEle.getAttribute("data-location-id");
                var locationDisplayName_source = sourceLocationLinkEle.getAttribute("data-location-display-name");
                closeMergeLocationModalFn();
                cityssm.confirmModal("Confirm Merge", "Are you sure you want to update all licences associated with" +
                    " <em>" + locationDisplayName_source + ", #" + locationID_source + "</em>" +
                    " and associate them with" +
                    " <em>" + locationDisplayNameAndID_target + "</em>?", "Yes, Complete Merge", "warning", doMerge);
            };
            var filterLocationsFn = function () {
                var filterSplit = locationFilterEle.value
                    .trim()
                    .toLowerCase()
                    .split(" ");
                var listEle = document.createElement("div");
                listEle.className = "panel";
                for (var locationIndex = 0; locationIndex < locationsList.length; locationIndex += 1) {
                    var locationObj = locationsList[locationIndex];
                    if (locationObj.locationID === intLocationID_1) {
                        continue;
                    }
                    var showLocation = true;
                    for (var filterIndex = 0; filterIndex < filterSplit.length; filterIndex += 1) {
                        var filterString = filterSplit[filterIndex];
                        if (locationObj.locationName.toLowerCase().indexOf(filterString) === -1) {
                            showLocation = false;
                            break;
                        }
                    }
                    if (!showLocation) {
                        continue;
                    }
                    var listItemEle = document.createElement("a");
                    listItemEle.className = "panel-block is-block";
                    listItemEle.setAttribute("data-location-id", locationObj.locationID);
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
                cityssm.clearElement(sourceLocationsContainerEle);
                sourceLocationsContainerEle.insertAdjacentElement("beforeend", listEle);
            };
            cityssm.openHtmlModal("locationMerge", {
                onshow: function (modalEle) {
                    var locationDisplayNameAndID_target_eles = modalEle.getElementsByClassName("mergeLocation--locationDisplayNameAndID_target");
                    for (var index = 0; index < locationDisplayNameAndID_target_eles.length; index += 1) {
                        locationDisplayNameAndID_target_eles[index].innerText = locationDisplayNameAndID_target;
                    }
                    sourceLocationsContainerEle = document.getElementById("container--sourceLocations");
                    locationFilterEle = document.getElementById("mergeLocation--locationFilter");
                    locationFilterEle.addEventListener("keyup", filterLocationsFn);
                },
                onshown: function (_modalEle, closeModalFn) {
                    closeMergeLocationModalFn = closeModalFn;
                    cityssm.postJSON("/locations/doGetLocations", {
                        limit: -1
                    }, function (responseJSON) {
                        locationsList = responseJSON.locations;
                        locationFilterEle.removeAttribute("disabled");
                        locationFilterEle.focus();
                        filterLocationsFn();
                    });
                }
            });
        });
    }
    function setUnsavedChanges() {
        hasUnsavedChanges = true;
        cityssm.enableNavBlocker();
        formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
    }
    var inputEles = formEle.getElementsByTagName("input");
    for (var inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
        inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
    }
    var locationNameEle = document.getElementById("location--locationName");
    if (isCreate) {
        locationNameEle.focus();
    }
    var locationIsDistributorCheckboxEle = document.getElementById("location--locationIsDistributor");
    var locationIsManufacturerCheckboxEle = document.getElementById("location--locationIsManufacturer");
    function setLocationNameRequired() {
        if (locationIsDistributorCheckboxEle.checked || locationIsManufacturerCheckboxEle.checked) {
            locationNameEle.setAttribute("required", "required");
        }
        else {
            locationNameEle.removeAttribute("required");
        }
    }
    locationIsDistributorCheckboxEle.addEventListener("change", setLocationNameRequired);
    locationIsManufacturerCheckboxEle.addEventListener("change", setLocationNameRequired);
}());
