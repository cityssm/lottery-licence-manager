"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var formEle = document.getElementById("form--licence");
    var formMessageEle = document.getElementById("container--form-message");
    var licenceID = document.getElementById("licence--licenceID").value;
    var isCreate = licenceID === "";
    var isIssued = formEle.getAttribute("data-licence-is-issued") === "true";
    var refreshInputTypes = [
        "number",
        "date",
        "time"
    ];
    var doRefreshAfterSave = false;
    var hasUnsavedChanges = false;
    var eventsContainerEle = document.getElementById("container--events");
    formEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
        var eventDateInputEles = eventsContainerEle.getElementsByTagName("input");
        if (eventDateInputEles.length === 0) {
            cityssm.alertModal("Event Date Error", "Please ensure there is at least one event date.", "OK", "warning");
            return;
        }
        formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON("/licences/doSave", formEle, function (responseJSON) {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
                hasUnsavedChanges = false;
            }
            if (responseJSON.success && isCreate) {
                window.location.href = "/licences/" + responseJSON.licenceID + "/edit";
            }
            else if (responseJSON.success && doRefreshAfterSave) {
                window.location.reload(true);
            }
            else {
                formMessageEle.innerHTML = "";
                cityssm.alertModal(responseJSON.message, "", "OK", responseJSON.success ? "success" : "danger");
                var removeInputEles = document.getElementsByClassName("is-removed-after-save");
                for (var index = 0; index < removeInputEles.length; index += 1) {
                    removeInputEles[index].remove();
                }
            }
        });
    });
    if (!isCreate) {
        document.getElementById("is-delete-licence-button").addEventListener("click", function (clickEvent) {
            clickEvent.preventDefault();
            cityssm.confirmModal("Delete Licence?", "Are you sure you want to delete this licence and all events associated with it?", "Yes, Delete", "danger", function () {
                cityssm.postJSON("/licences/doDelete", {
                    licenceID: licenceID
                }, function (responseJSON) {
                    if (responseJSON.success) {
                        cityssm.disableNavBlocker();
                        window.location.href = "/licences";
                    }
                });
            });
        });
    }
    function setDoRefreshAfterSave() {
        doRefreshAfterSave = true;
    }
    function setUnsavedChanges(changeEvent) {
        cityssm.enableNavBlocker();
        hasUnsavedChanges = true;
        formMessageEle.innerHTML = "<span class=\"tag is-light is-info is-medium\">" +
            "<span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span>" +
            " <span>Unsaved Changes</span>" +
            "</div>";
        if (!isCreate) {
            document.getElementById("is-add-transaction-button").setAttribute("disabled", "disabled");
            document.getElementById("is-disabled-transaction-message").classList.remove("is-hidden");
        }
        if (changeEvent) {
            var currentTargetType = (changeEvent.currentTarget instanceof HTMLInputElement ? changeEvent.currentTarget.type : "");
            if (refreshInputTypes.includes(currentTargetType)) {
                setDoRefreshAfterSave();
            }
        }
    }
    var inputEles = formEle.querySelectorAll("input, select, textarea");
    for (var inputIndex = 0; inputIndex < inputEles.length; inputIndex += 1) {
        if (inputEles[inputIndex].name !== "") {
            inputEles[inputIndex].addEventListener("change", setUnsavedChanges);
        }
    }
    var externalLicenceNumberUnlockBtnEle = document.getElementById("is-external-licence-number-unlock-button");
    if (externalLicenceNumberUnlockBtnEle) {
        externalLicenceNumberUnlockBtnEle.addEventListener("click", function () {
            var externalLicenceNumberEle = document.getElementById("licence--externalLicenceNumber");
            externalLicenceNumberEle.classList.remove("is-readonly");
            externalLicenceNumberEle.removeAttribute("readonly");
            externalLicenceNumberEle.focus();
        });
    }
    {
        var organizationList_1 = [];
        var organizationLookupCloseModalFn_1;
        var organizationLookupSearchStrEle_1;
        var organizationLookupResultsEle_1;
        var organizationLookupFn_setOrganization_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var organizationEle = clickEvent.currentTarget;
            document.getElementById("licence--organizationID").value =
                organizationEle.getAttribute("data-organization-id");
            document.getElementById("licence--organizationName").value =
                organizationEle.getAttribute("data-organization-name");
            organizationLookupCloseModalFn_1();
            setUnsavedChanges();
        };
        var organizationLookupFn_refreshResults_1 = function () {
            var listEle = document.createElement("div");
            listEle.className = "list is-hoverable";
            var searchStringSplit = organizationLookupSearchStrEle_1.value
                .trim()
                .toLowerCase()
                .split(" ");
            var displayLimit = 10;
            for (var organizationIndex = 0; organizationIndex < organizationList_1.length && displayLimit > 0; organizationIndex += 1) {
                var doDisplayRecord = true;
                var organizationObj = organizationList_1[organizationIndex];
                if (!organizationObj.isEligibleForLicences) {
                    continue;
                }
                var organizationName = organizationObj.organizationName.toLowerCase();
                for (var searchStringIndex = 0; searchStringIndex < searchStringSplit.length; searchStringIndex += 1) {
                    if (organizationName.indexOf(searchStringSplit[searchStringIndex]) === -1) {
                        doDisplayRecord = false;
                        break;
                    }
                }
                if (doDisplayRecord) {
                    displayLimit -= 1;
                    var listItemEle = document.createElement("a");
                    listItemEle.className = "list-item";
                    listItemEle.setAttribute("data-organization-id", organizationObj.organizationID);
                    listItemEle.setAttribute("data-organization-name", organizationObj.organizationName);
                    listItemEle.setAttribute("href", "#");
                    listItemEle.innerHTML = organizationObj.organizationName + "<br />" +
                        "<span class=\"is-size-7\">" +
                        "<span class=\"icon\"><i class=\"fas fa-user\" aria-hidden=\"true\"></i></span> " +
                        organizationObj.representativeName +
                        "</span>";
                    listItemEle.addEventListener("click", organizationLookupFn_setOrganization_1);
                    listEle.appendChild(listItemEle);
                }
            }
            cityssm.clearElement(organizationLookupResultsEle_1);
            organizationLookupResultsEle_1.insertAdjacentElement("beforeend", listEle);
        };
        var organizationLookupFn_openModal = function () {
            cityssm.openHtmlModal("licence-organizationLookup", {
                onshow: function () {
                    organizationLookupSearchStrEle_1 = document.getElementById("organizationLookup--searchStr");
                    organizationLookupSearchStrEle_1.addEventListener("keyup", organizationLookupFn_refreshResults_1);
                    organizationLookupResultsEle_1 = document.getElementById("container--organizationLookup");
                    if (organizationList_1.length === 0) {
                        cityssm.postJSON("/organizations/doGetAll", null, function (organizationListRes) {
                            organizationList_1 = organizationListRes;
                            organizationLookupSearchStrEle_1.removeAttribute("disabled");
                            organizationLookupFn_refreshResults_1();
                            organizationLookupSearchStrEle_1.focus();
                        });
                    }
                    else {
                        organizationLookupSearchStrEle_1.removeAttribute("disabled");
                        organizationLookupFn_refreshResults_1();
                        organizationLookupSearchStrEle_1.focus();
                    }
                },
                onshown: function (_modalEle, closeModalFn) {
                    organizationLookupCloseModalFn_1 = closeModalFn;
                    organizationLookupSearchStrEle_1.focus();
                },
                onremoved: function () {
                    document.getElementById("is-organization-lookup-button").focus();
                }
            });
        };
        document.getElementById("is-organization-lookup-button").addEventListener("click", organizationLookupFn_openModal);
        document.getElementById("licence--organizationName").addEventListener("dblclick", organizationLookupFn_openModal);
    }
    var locationList = [];
    function loadLocationList(callbackFn) {
        if (locationList.length === 0) {
            cityssm.postJSON("/locations/doGetLocations", null, function (locationResults) {
                locationList = locationResults.locations;
                callbackFn();
            });
        }
        else {
            callbackFn();
        }
    }
    {
        var locationLookup_closeModalFn_1;
        var locationLookup_searchStrEle_1;
        var locationLookup_resultsEle_1;
        var locationLookupFn_setLocation_1 = function (locationIDString, locationDisplayName) {
            document.getElementById("licence--locationID").value = locationIDString;
            document.getElementById("licence--locationDisplayName").value = locationDisplayName;
        };
        var locationLookupFn_setLocationFromExisting_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var locationEle = clickEvent.currentTarget;
            locationLookupFn_setLocation_1(locationEle.getAttribute("data-location-id"), locationEle.getAttribute("data-location-display-name"));
            locationLookup_closeModalFn_1();
            setUnsavedChanges();
        };
        var locationLookupFn_refreshResults_1 = function () {
            var listEle = document.createElement("div");
            listEle.className = "list is-hoverable";
            var searchStringSplit = locationLookup_searchStrEle_1.value
                .trim()
                .toLowerCase()
                .split(" ");
            var displayLimit = 10;
            for (var locationIndex = 0; locationIndex < locationList.length && displayLimit > 0; locationIndex += 1) {
                var doDisplayRecord = true;
                var locationObj = locationList[locationIndex];
                var locationName = locationObj.locationName.toLowerCase();
                for (var searchStringIndex = 0; searchStringIndex < searchStringSplit.length; searchStringIndex += 1) {
                    if (locationName.indexOf(searchStringSplit[searchStringIndex]) === -1) {
                        doDisplayRecord = false;
                        break;
                    }
                }
                if (doDisplayRecord) {
                    displayLimit -= 1;
                    var listItemEle = document.createElement("a");
                    listItemEle.className = "list-item";
                    listItemEle.setAttribute("data-location-id", locationObj.locationID.toString());
                    listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
                    listItemEle.setAttribute("href", "#");
                    listItemEle.innerHTML = "<div class=\"columns\">" +
                        "<div class=\"column is-narrow\">" +
                        "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationDisplayName) + "</div>" +
                        (locationObj.locationName === "" ?
                            "" :
                            "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationAddress1) + "</div>") +
                        "</div>";
                    listItemEle.addEventListener("click", locationLookupFn_setLocationFromExisting_1);
                    listEle.insertAdjacentElement("beforeend", listItemEle);
                }
            }
            cityssm.clearElement(locationLookup_resultsEle_1);
            locationLookup_resultsEle_1.insertAdjacentElement("beforeend", listEle);
        };
        var locationLookupFn_openModal = function () {
            cityssm.openHtmlModal("licence-locationLookup", {
                onshow: function (modalEle) {
                    locationLookup_searchStrEle_1 = document.getElementById("locationLookup--searchStr");
                    locationLookup_searchStrEle_1.addEventListener("keyup", locationLookupFn_refreshResults_1);
                    locationLookup_resultsEle_1 = document.getElementById("container--locationLookup");
                    loadLocationList(function () {
                        locationLookup_searchStrEle_1.removeAttribute("disabled");
                        locationLookupFn_refreshResults_1();
                        locationLookup_searchStrEle_1.focus();
                    });
                    llm.getDefaultConfigProperty("city", function (defaultCity) {
                        if (defaultCity) {
                            document.getElementById("newLocation--locationCity").value = defaultCity;
                        }
                    });
                    llm.getDefaultConfigProperty("province", function (defaultProvince) {
                        if (defaultProvince) {
                            document.getElementById("newLocation--locationProvince").value = defaultProvince;
                        }
                    });
                    document.getElementById("form--newLocation").addEventListener("submit", function (formEvent) {
                        formEvent.preventDefault();
                        cityssm.postJSON("/locations/doCreate", formEvent.currentTarget, function (responseJSON) {
                            if (responseJSON.success) {
                                locationList = [];
                                locationLookupFn_setLocation_1(responseJSON.locationID, responseJSON.locationDisplayName);
                                locationLookup_closeModalFn_1();
                            }
                        });
                    });
                    llm.initializeTabs(modalEle.querySelector(".tabs ul"));
                },
                onshown: function (_modalEle, closeModalFn) {
                    locationLookup_closeModalFn_1 = closeModalFn;
                    locationLookup_searchStrEle_1.focus();
                },
                onremoved: function () {
                    document.getElementById("is-location-lookup-button").focus();
                }
            });
        };
        document.getElementById("is-location-lookup-button").addEventListener("click", locationLookupFn_openModal);
        document.getElementById("licence--locationDisplayName").addEventListener("dblclick", locationLookupFn_openModal);
    }
    {
        var termsConditionsList_1 = [];
        var termsConditionsLookupModalEle_1 = document.getElementById("is-termsConditions-lookup-modal");
        var termsConditionsLookupResultsEle_1 = document.getElementById("container--termsConditionsPrevious");
        var termsConditionsLookupFn_setTermsConditions_1 = function (clickEvent) {
            clickEvent.preventDefault();
            var termsConditionsIndex = parseInt(clickEvent.currentTarget.getAttribute("data-terms-conditions-index"));
            var termsConditionsEle = document.getElementById("licence--termsConditions");
            termsConditionsEle.value = termsConditionsList_1[termsConditionsIndex].termsConditions;
            cityssm.hideModal(termsConditionsLookupModalEle_1);
            termsConditionsEle.focus();
            setUnsavedChanges();
        };
        document.getElementById("is-termsConditions-lookup-button").addEventListener("click", function () {
            termsConditionsList_1 = [];
            cityssm.clearElement(termsConditionsLookupResultsEle_1);
            var organizationID = document.getElementById("licence--organizationID").value;
            if (organizationID === "") {
                cityssm.alertModal("No Organization Selected", "An organization must be selected before the previously used terms and conditions can be retrieved.", "OK", "warning");
                return;
            }
            termsConditionsLookupResultsEle_1.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
                "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
                "Loading previously used terms and conditions..." +
                "</p>";
            cityssm.postJSON("/licences/doGetDistinctTermsConditions", {
                organizationID: organizationID
            }, function (termsConditionsListRes) {
                termsConditionsList_1 = termsConditionsListRes;
                if (termsConditionsList_1.length === 0) {
                    termsConditionsLookupResultsEle_1.innerHTML = "<p class=\"has-text-centered\">" +
                        "No previously used terms and conditions found for this organization." +
                        "</p>";
                }
                else {
                    var listEle = document.createElement("div");
                    listEle.className = "list is-hoverable has-margin-bottom-10";
                    for (var termsConditionsIndex = 0; termsConditionsIndex < termsConditionsList_1.length; termsConditionsIndex += 1) {
                        var termsConditionsObj = termsConditionsList_1[termsConditionsIndex];
                        var listItemEle = document.createElement("a");
                        listItemEle.className = "list-item";
                        listItemEle.setAttribute("data-terms-conditions-index", termsConditionsIndex.toString());
                        listItemEle.innerHTML = "<p class=\"has-newline-chars\">" +
                            cityssm.escapeHTML(termsConditionsObj.termsConditions) +
                            "</p>" +
                            "<p class=\"has-text-right\">" +
                            (termsConditionsObj.termsConditionsCount > 1 ?
                                "<span class=\"tag is-light\">Used " + termsConditionsObj.termsConditionsCount + " times</span>" :
                                "") +
                            "<span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Most Recent Licence Start Date\">" + termsConditionsObj.startDateMaxString + "</span>" +
                            "</p>";
                        listItemEle.addEventListener("click", termsConditionsLookupFn_setTermsConditions_1);
                        listEle.insertAdjacentElement("beforeend", listItemEle);
                    }
                    cityssm.clearElement(termsConditionsLookupResultsEle_1);
                    termsConditionsLookupResultsEle_1.insertAdjacentElement("beforeend", listEle);
                }
            });
            cityssm.showModal(termsConditionsLookupModalEle_1);
        });
        var cancelButtonEles = termsConditionsLookupModalEle_1.getElementsByClassName("is-close-modal-button");
        for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
            cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
        }
    }
    var licenceType_selectEle = document.getElementById("licence--licenceTypeKey");
    if (isCreate) {
        var licenceType_fieldContainerEles_1 = document.getElementsByClassName("container-licenceTypeFields");
        var changeFn_licenceType = function () {
            var optionEle = licenceType_selectEle.selectedOptions[0];
            var totalPrizeValueMax = optionEle.getAttribute("data-total-prize-value-max");
            document.getElementById("licence--totalPrizeValue").setAttribute("max", totalPrizeValueMax);
            var hasTicketTypes = optionEle.getAttribute("data-has-ticket-types") === "true";
            var totalPrizeValueEle = document.getElementById("licence--totalPrizeValue");
            if (hasTicketTypes) {
                document.getElementById("is-ticket-types-panel").classList.remove("is-hidden");
                totalPrizeValueEle.setAttribute("readonly", "readonly");
                totalPrizeValueEle.classList.add("is-readonly");
            }
            else {
                var ticketTypesPanelEle_1 = document.getElementById("is-ticket-types-panel");
                ticketTypesPanelEle_1.classList.add("is-hidden");
                cityssm.clearElement(ticketTypesPanelEle_1.getElementsByTagName("tbody")[0]);
                cityssm.clearElement(ticketTypesPanelEle_1.getElementsByTagName("tfoot")[0]);
                totalPrizeValueEle.removeAttribute("readonly");
                totalPrizeValueEle.classList.remove("is-readonly");
            }
            var licenceTypeKey = licenceType_selectEle.value;
            var idToShow = "container-licenceTypeFields--" + licenceTypeKey;
            for (var containerIndex = 0; containerIndex < licenceType_fieldContainerEles_1.length; containerIndex += 1) {
                var fieldContainerEle = licenceType_fieldContainerEles_1[containerIndex];
                if (fieldContainerEle.id === idToShow) {
                    licenceType_fieldContainerEles_1[containerIndex].removeAttribute("disabled");
                    licenceType_fieldContainerEles_1[containerIndex].classList.remove("is-hidden");
                }
                else {
                    licenceType_fieldContainerEles_1[containerIndex].classList.add("is-hidden");
                    licenceType_fieldContainerEles_1[containerIndex].setAttribute("disabled", "disabled");
                }
            }
        };
        licenceType_selectEle.addEventListener("change", changeFn_licenceType);
    }
    {
        var startDateEle_1 = document.getElementById("licence--startDateString");
        var endDateEle_1 = document.getElementById("licence--endDateString");
        var dateFn_setMin = function () {
            var startDateString = startDateEle_1.value;
            endDateEle_1.setAttribute("min", startDateString);
            if (endDateEle_1.value < startDateString) {
                endDateEle_1.value = startDateString;
            }
            var eventDateEles = eventsContainerEle.getElementsByTagName("input");
            for (var eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {
                eventDateEles[eleIndex].setAttribute("min", startDateString);
            }
        };
        var dateFn_setMax = function () {
            var endDateString = endDateEle_1.value;
            var eventDateEles = eventsContainerEle.getElementsByTagName("input");
            for (var eleIndex = 0; eleIndex < eventDateEles.length; eleIndex += 1) {
                eventDateEles[eleIndex].setAttribute("max", endDateString);
            }
        };
        document.getElementById("licence--applicationDateString").addEventListener("change", function (changeEvent) {
            startDateEle_1.setAttribute("min", changeEvent.currentTarget.value);
        });
        startDateEle_1.addEventListener("change", dateFn_setMin);
        endDateEle_1.addEventListener("change", dateFn_setMax);
        var eventFn_remove_1 = function (clickEvent) {
            clickEvent.currentTarget.closest(".panel-block").remove();
            doRefreshAfterSave = true;
            setUnsavedChanges();
        };
        var eventFn_add_1 = function (eventDate) {
            var eventDateString = "";
            if (eventDate) {
                if (eventDate instanceof Date) {
                    eventDateString = eventDate.getFullYear() + "-" +
                        ("00" + (eventDate.getMonth() + 1)).slice(-2) + "-" +
                        ("00" + eventDate.getDate()).slice(-2);
                }
                else if (eventDate.constructor === String) {
                    eventDateString = eventDate;
                }
                else if (eventDate instanceof Event) {
                    try {
                        eventDate.preventDefault();
                        var sourceEleID = eventDate.currentTarget.getAttribute("data-source");
                        eventDateString = document.getElementById(sourceEleID).value;
                    }
                    catch (e) {
                    }
                }
            }
            eventsContainerEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                "<div class=\"field has-addons\">" +
                ("<div class=\"control is-expanded has-icons-left\">" +
                    "<input class=\"input is-small\" name=\"eventDate\" type=\"date\"" +
                    " value=\"" + eventDateString + "\"" +
                    " min=\"" + startDateEle_1.value + "\"" +
                    " max=\"" + endDateEle_1.value + "\"" +
                    " required />" +
                    "<span class=\"icon is-left\">" +
                    "<i class=\"fas fa-calendar\" aria-hidden=\"true\"></i>" +
                    "</span>" +
                    "</div>") +
                ("<div class=\"control\">" +
                    "<a class=\"button is-small is-danger has-tooltip-right\" role=\"button\" data-tooltip=\"Remove Event\">" +
                    "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                    "<span class=\"sr-only\">Remove Event</span>" +
                    "</a>" +
                    "</div>") +
                "</div>" +
                "</div>");
            var buttonEles = eventsContainerEle.getElementsByTagName("a");
            buttonEles[buttonEles.length - 1].addEventListener("click", eventFn_remove_1);
            doRefreshAfterSave = true;
            setUnsavedChanges();
        };
        var eventCalculator_modalEle_1 = document.getElementById("is-event-calculator-modal");
        document.getElementsByClassName("is-calculate-events-button")[0].addEventListener("click", function () {
            var eventCount = parseInt(document.getElementById("eventCalc--eventCount").value);
            var dayInterval = parseInt(document.getElementById("eventCalc--dayInterval").value);
            var dateSplit = endDateEle_1.value.split("-");
            var endDate = new Date(parseInt(dateSplit[0]), parseInt(dateSplit[1]) - 1, parseInt(dateSplit[2]));
            dateSplit = startDateEle_1.value.split("-");
            var eventDate = new Date(parseInt(dateSplit[0]), parseInt(dateSplit[1]) - 1, parseInt(dateSplit[2]));
            for (var eventNum = 0; eventNum < eventCount && eventDate.getTime() <= endDate.getTime(); eventNum += 1) {
                eventFn_add_1(eventDate);
                eventDate.setDate(eventDate.getDate() + dayInterval);
            }
            cityssm.hideModal(eventCalculator_modalEle_1);
        });
        document.getElementById("is-event-calculator-button").addEventListener("click", function () {
            cityssm.showModal(eventCalculator_modalEle_1);
        });
        var cancelButtonEles = eventCalculator_modalEle_1.getElementsByClassName("is-close-modal-button");
        for (var buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
            cancelButtonEles[buttonIndex].addEventListener("click", cityssm.hideModal);
        }
        var addEventBtnEles = document.getElementsByClassName("is-add-event-button");
        for (var btnIndex = 0; btnIndex < addEventBtnEles.length; btnIndex += 1) {
            addEventBtnEles[btnIndex].addEventListener("click", eventFn_add_1);
        }
    }
    var ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");
    if (ticketTypesPanelEle) {
        var licenceTypeKeyToTicketTypes_1 = new Map();
        var ticketTypes_getAll_1 = function (callbackFn) {
            var licenceTypeKey = licenceType_selectEle.value;
            if (licenceTypeKeyToTicketTypes_1.has(licenceTypeKey)) {
                callbackFn(licenceTypeKeyToTicketTypes_1.get(licenceTypeKey));
            }
            else {
                cityssm.postJSON("/licences/doGetTicketTypes", {
                    licenceTypeKey: licenceTypeKey
                }, function (ticketTypes) {
                    licenceTypeKeyToTicketTypes_1.set(licenceTypeKey, ticketTypes);
                    callbackFn(ticketTypes);
                });
            }
        };
        var ticketTypes_calculateTfoot_1 = function () {
            var prizeValueTotal = 0;
            var prizeValueEles = ticketTypesPanelEle.getElementsByClassName("is-total-prizes-per-deal");
            for (var eleIndex = 0; eleIndex < prizeValueEles.length; eleIndex += 1) {
                prizeValueTotal += parseFloat(prizeValueEles[eleIndex].value);
            }
            var licenceFeeTotal = 0;
            var licenceFeeEles = ticketTypesPanelEle.getElementsByClassName("is-licence-fee");
            for (var eleIndex = 0; eleIndex < licenceFeeEles.length; eleIndex += 1) {
                licenceFeeTotal += parseFloat(licenceFeeEles[eleIndex].value);
            }
            ticketTypesPanelEle.getElementsByTagName("tfoot")[0].innerHTML = "<tr>" +
                "<td></td>" +
                "<td></td>" +
                "<td></td>" +
                "<th class=\"has-text-right is-nowrap\">$ " + prizeValueTotal.toFixed(2) + "</th>" +
                "<td class=\"is-hidden-print\"></td>" +
                "<th class=\"has-text-right is-nowrap\">$ " + licenceFeeTotal.toFixed(2) + "</th>" +
                "<td></td>" +
                "<td class=\"is-hidden-print\"></td>" +
                "<td></td>" +
                "<td class=\"is-hidden-print\"></td>" +
                "</tr>";
            document.getElementById("licence--totalPrizeValue").value = prizeValueTotal.toFixed(2);
        };
        var deleteTicketType_openConfirm_1 = function (buttonEvent) {
            var trEle = buttonEvent.currentTarget.closest("tr");
            var ticketType = trEle.getAttribute("data-ticket-type");
            var doDeleteTicketType = function () {
                trEle.remove();
                if (!isCreate) {
                    var addEle = formEle.querySelector("input[name='ticketType_toAdd'][value='" + ticketType + "']");
                    if (addEle) {
                        addEle.remove();
                    }
                    else {
                        formEle.insertAdjacentHTML("beforeend", "<input class=\"is-removed-after-save\" name=\"ticketType_toDelete\"" +
                            " type=\"hidden\" value=\"" + ticketType + "\" />");
                    }
                }
                ticketTypes_calculateTfoot_1();
                setUnsavedChanges();
                setDoRefreshAfterSave();
            };
            cityssm.confirmModal("Delete Ticket Type?", "Are you sure you want to remove the " + ticketType + " ticket type for this licence?", "Yes, Delete", "danger", doDeleteTicketType);
        };
        var amendUnitCount_openModal_1 = function (buttonEvent) {
            var trEle = buttonEvent.currentTarget.closest("tr");
            var ticketType = trEle.getAttribute("data-ticket-type");
            var ticketTypeObj;
            var amendUnitCount_closeModalFn;
            var amendUnitCount_closeAndUpdate = function (formEvent) {
                formEvent.preventDefault();
                var unitCount = parseInt(document.getElementById("amendUnit_unitCount").value);
                var unitCountEle = trEle.querySelector("input[name='ticketType_unitCount']");
                unitCountEle.value = unitCount.toString();
                unitCountEle.nextElementSibling.innerText = unitCount.toString();
                var totalValueEle = trEle.getElementsByClassName("is-total-value-per-deal")[0];
                totalValueEle.value = (ticketTypeObj.ticketPrice * ticketTypeObj.ticketCount * unitCount).toFixed(2);
                totalValueEle.nextElementSibling.innerText = "$" + (ticketTypeObj.ticketPrice * ticketTypeObj.ticketCount * unitCount).toFixed(2);
                var totalPrizesEle = trEle.getElementsByClassName("is-total-prizes-per-deal")[0];
                totalPrizesEle.value = (ticketTypeObj.prizesPerDeal * unitCount).toFixed(2);
                totalPrizesEle.nextElementSibling.innerText = "$" + (ticketTypeObj.prizesPerDeal * unitCount).toFixed(2);
                var licenceFee = document.getElementById("amendUnit_licenceFee").value;
                var licenceFeeEle = trEle.querySelector("input[name='ticketType_licenceFee']");
                licenceFeeEle.value = licenceFee;
                licenceFeeEle.nextElementSibling.innerText = "$ " + licenceFee;
                amendUnitCount_closeModalFn();
                ticketTypes_calculateTfoot_1();
                setUnsavedChanges();
                setDoRefreshAfterSave();
            };
            var amendUnitCount_calculateLicenceFee = function () {
                document.getElementById("amendUnit_licenceFee").value =
                    (ticketTypeObj.feePerUnit * parseInt(document.getElementById("amendUnit_unitCount").value)).toFixed(2);
            };
            cityssm.openHtmlModal("licence-ticketTypeUnitAmend", {
                onshow: function (modalEle) {
                    document.getElementById("amendUnit_ticketType").value = ticketType;
                    var unitCountCurrent = trEle.querySelector("input[name='ticketType_unitCount']").value;
                    document.getElementById("amendUnit_unitCountCurrent").value = unitCountCurrent;
                    var unitCountEle = document.getElementById("amendUnit_unitCount");
                    unitCountEle.value = unitCountCurrent;
                    ticketTypes_getAll_1(function (ticketTypes) {
                        ticketTypeObj = ticketTypes.find(function (ele) { return ele.ticketType === ticketType; });
                        unitCountEle.addEventListener("change", amendUnitCount_calculateLicenceFee);
                        amendUnitCount_calculateLicenceFee();
                    });
                    modalEle.getElementsByTagName("form")[0].addEventListener("submit", amendUnitCount_closeAndUpdate);
                },
                onshown: function (_modalEle, closeModalFn) {
                    amendUnitCount_closeModalFn = closeModalFn;
                }
            });
        };
        var amendDistributor_openModal_1 = function (buttonEvent) {
            var distributorLookup_closeModalFn;
            var distributorTdEle = buttonEvent.currentTarget.closest("td").previousElementSibling;
            var distributorLookup_updateDistributor = function (locationButtonEvent) {
                var locationButtonEle = locationButtonEvent.currentTarget;
                distributorTdEle.getElementsByTagName("input")[0].value = locationButtonEle.getAttribute("data-location-id");
                distributorTdEle.getElementsByTagName("span")[0].innerText = locationButtonEle.getAttribute("data-location-display-name");
                distributorLookup_closeModalFn();
                setUnsavedChanges();
            };
            cityssm.openHtmlModal("licence-distributorLookup", {
                onshow: function () {
                    loadLocationList(function () {
                        var listEle = document.createElement("div");
                        listEle.className = "list is-hoverable";
                        for (var index = 0; index < locationList.length; index += 1) {
                            var locationObj = locationList[index];
                            if (!locationObj.locationIsDistributor) {
                                continue;
                            }
                            var listItemEle = document.createElement("a");
                            listItemEle.className = "list-item";
                            listItemEle.setAttribute("data-location-id", locationObj.locationID.toString());
                            listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
                            listItemEle.innerHTML = "<div class=\"columns\">" +
                                "<div class=\"column is-narrow\">" +
                                "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                                "</div>" +
                                "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationDisplayName) + "</div>" +
                                (locationObj.locationName === "" ?
                                    "" :
                                    "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationAddress1) + "</div>") +
                                "</div>";
                            listItemEle.addEventListener("click", distributorLookup_updateDistributor);
                            listEle.insertAdjacentElement("beforeend", listItemEle);
                        }
                        var lookupContainerEle = document.getElementById("container--distributorLookup");
                        cityssm.clearElement(lookupContainerEle);
                        lookupContainerEle.insertAdjacentElement("beforeend", listEle);
                    });
                },
                onshown: function (_modalEle, closeModalFn) {
                    distributorLookup_closeModalFn = closeModalFn;
                }
            });
        };
        var amendManufacturer_openModal_1 = function (buttonEvent) {
            var manufacturerLookup_closeModalFn;
            var manufacturerTdEle = buttonEvent.currentTarget.closest("td").previousElementSibling;
            var manufacturerLookup_updateManufacturer = function (locationButtonEvent) {
                var locationButtonEle = locationButtonEvent.currentTarget;
                manufacturerTdEle.getElementsByTagName("input")[0].value = locationButtonEle.getAttribute("data-location-id");
                manufacturerTdEle.getElementsByTagName("span")[0].innerText = locationButtonEle.getAttribute("data-location-display-name");
                manufacturerLookup_closeModalFn();
                setUnsavedChanges();
            };
            cityssm.openHtmlModal("licence-manufacturerLookup", {
                onshow: function () {
                    loadLocationList(function () {
                        var listEle = document.createElement("div");
                        listEle.className = "list is-hoverable";
                        for (var index = 0; index < locationList.length; index += 1) {
                            var locationObj = locationList[index];
                            if (!locationObj.locationIsManufacturer) {
                                continue;
                            }
                            var listItemEle = document.createElement("a");
                            listItemEle.className = "list-item";
                            listItemEle.setAttribute("data-location-id", locationObj.locationID.toString());
                            listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
                            listItemEle.innerHTML = "<div class=\"columns\">" +
                                "<div class=\"column is-narrow\">" +
                                "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                                "</div>" +
                                "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationDisplayName) + "</div>" +
                                (locationObj.locationName === "" ?
                                    "" :
                                    "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationAddress1) + "</div>") +
                                "</div>";
                            listItemEle.addEventListener("click", manufacturerLookup_updateManufacturer);
                            listEle.insertAdjacentElement("beforeend", listItemEle);
                        }
                        var lookupContainerEle = document.getElementById("container--manufacturerLookup");
                        cityssm.clearElement(lookupContainerEle);
                        lookupContainerEle.insertAdjacentElement("beforeend", listEle);
                    });
                },
                onshown: function (_modalEle, closeModalFn) {
                    manufacturerLookup_closeModalFn = closeModalFn;
                }
            });
        };
        var addTicketType_openModal = function () {
            var addTicketType_closeModalFn;
            var addTicketType_ticketTypeEle;
            var addTicketType_unitCountEle;
            var addTicketType_addTicketType = function (formEvent) {
                formEvent.preventDefault();
                ticketTypes_addTr_1({
                    ticketType: document.getElementById("ticketTypeAdd--ticketType").value,
                    unitCount: parseInt(document.getElementById("ticketTypeAdd--unitCount").value),
                    valuePerDeal: parseFloat(document.getElementById("ticketTypeAdd--valuePerDeal").value),
                    prizesPerDeal: parseFloat(document.getElementById("ticketTypeAdd--prizesPerDeal").value),
                    licenceFee: parseFloat(document.getElementById("ticketTypeAdd--licenceFee").value)
                });
                if (!isCreate) {
                    formEle.insertAdjacentHTML("beforeend", "<input class=\"is-removed-after-save\" name=\"ticketType_toAdd\"" +
                        " type=\"hidden\" value=\"" + document.getElementById("ticketTypeAdd--ticketType").value + "\" />");
                }
                addTicketType_closeModalFn();
            };
            var addTicketType_refreshUnitCountChange = function () {
                var unitCount = parseInt(addTicketType_unitCountEle.value);
                document.getElementById("ticketTypeAdd--prizesTotal").value =
                    (parseFloat(document.getElementById("ticketTypeAdd--prizesPerDeal").value) * unitCount).toFixed(2);
                document.getElementById("ticketTypeAdd--licenceFee").value =
                    (parseFloat(document.getElementById("ticketTypeAdd--feePerUnit").value) * unitCount).toFixed(2);
            };
            var addTicketType_refreshTicketTypeChange = function () {
                var ticketTypeOptionEle = addTicketType_ticketTypeEle.selectedOptions[0];
                document.getElementById("ticketTypeAdd--ticketPrice").value = ticketTypeOptionEle.getAttribute("data-ticket-price");
                document.getElementById("ticketTypeAdd--ticketCount").value = ticketTypeOptionEle.getAttribute("data-ticket-count");
                document.getElementById("ticketTypeAdd--valuePerDeal").value =
                    (parseFloat(ticketTypeOptionEle.getAttribute("data-ticket-price")) * parseInt(ticketTypeOptionEle.getAttribute("data-ticket-count"))).toFixed(2);
                document.getElementById("ticketTypeAdd--prizesPerDeal").value = ticketTypeOptionEle.getAttribute("data-prizes-per-deal");
                document.getElementById("ticketTypeAdd--feePerUnit").value = ticketTypeOptionEle.getAttribute("data-fee-per-unit");
                addTicketType_refreshUnitCountChange();
            };
            var addTicketType_populateTicketTypeSelect = function (ticketTypes) {
                if (!ticketTypes || ticketTypes.length === 0) {
                    addTicketType_closeModalFn();
                    cityssm.alertModal("No ticket types available", "", "OK", "danger");
                    return;
                }
                for (var ticketTypeIndex = 0; ticketTypeIndex < ticketTypes.length; ticketTypeIndex += 1) {
                    var ticketTypeObj = ticketTypes[ticketTypeIndex];
                    if (ticketTypesPanelEle.querySelector("tr[data-ticket-type='" + ticketTypeObj.ticketType + "']")) {
                        continue;
                    }
                    var optionEle = document.createElement("option");
                    optionEle.setAttribute("data-ticket-price", ticketTypeObj.ticketPrice.toFixed(2));
                    optionEle.setAttribute("data-ticket-count", ticketTypeObj.ticketCount.toString());
                    optionEle.setAttribute("data-prizes-per-deal", ticketTypeObj.prizesPerDeal.toFixed(2));
                    optionEle.setAttribute("data-fee-per-unit", (ticketTypeObj.feePerUnit || 0).toFixed(2));
                    optionEle.value = ticketTypeObj.ticketType;
                    optionEle.innerText = ticketTypeObj.ticketType + " (" + ticketTypeObj.ticketCount + " tickets, $" + ticketTypeObj.ticketPrice.toFixed(2) + " each)";
                    addTicketType_ticketTypeEle.insertAdjacentElement("beforeend", optionEle);
                }
                addTicketType_refreshTicketTypeChange();
            };
            cityssm.openHtmlModal("licence-ticketTypeAdd", {
                onshow: function (modalEle) {
                    addTicketType_ticketTypeEle = document.getElementById("ticketTypeAdd--ticketType");
                    addTicketType_ticketTypeEle.addEventListener("change", addTicketType_refreshTicketTypeChange);
                    addTicketType_unitCountEle = document.getElementById("ticketTypeAdd--unitCount");
                    addTicketType_unitCountEle.addEventListener("change", addTicketType_refreshUnitCountChange);
                    modalEle.getElementsByTagName("form")[0].addEventListener("submit", addTicketType_addTicketType);
                },
                onshown: function (_modalEle, closeModalFn) {
                    addTicketType_closeModalFn = closeModalFn;
                    ticketTypes_getAll_1(addTicketType_populateTicketTypeSelect);
                }
            });
        };
        var ticketTypes_addTr_1 = function (obj) {
            var ticketType = obj.ticketType;
            var trEle = document.createElement("tr");
            trEle.setAttribute("data-ticket-type", ticketType);
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<input name=\"ticketType_ticketType\" type=\"hidden\" value=\"" + ticketType + "\" />" +
                "<span>" + ticketType + "</span>" +
                "</td>");
            var unitCount = obj.unitCount;
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
                "<input name=\"ticketType_unitCount\" type=\"hidden\" value=\"" + unitCount + "\" />" +
                "<span>" + unitCount + "</span>" +
                "</td>");
            var valuePerDeal = obj.valuePerDeal;
            var totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
                "<span data-tooltip=\"$" + valuePerDeal + " value per deal\">$ " + totalValuePerDeal + "</span>" +
                "</td>");
            var prizesPerDeal = obj.prizesPerDeal;
            var totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
                "<input class=\"is-total-prizes-per-deal\" type=\"hidden\" value=\"" + totalPrizesPerDeal + "\" />" +
                "<span data-tooltip=\"$" + prizesPerDeal + " prizes per deal\">$ " + totalPrizesPerDeal + "</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print\">" +
                "<div class=\"field has-addons\">" +
                ("<div class=\"control\">" +
                    "<button class=\"button is-small is-amend-ticket-type-unit-count-button\"" +
                    " data-tooltip=\"Amend Units\" type=\"button\">" +
                    "Amend" +
                    "</button>" +
                    "</div>") +
                ("<div class=\"control\">" +
                    "<button class=\"button is-small is-danger is-delete-ticket-type-button\"" +
                    " data-tooltip=\"Delete Ticket Type\" type=\"button\">" +
                    "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                    "<span class=\"sr-only\">Delete</span>" +
                    "</button>" +
                    "</div>") +
                "</div>" +
                "</td>");
            trEle.getElementsByClassName("is-amend-ticket-type-unit-count-button")[0]
                .addEventListener("click", amendUnitCount_openModal_1);
            trEle.getElementsByClassName("is-delete-ticket-type-button")[0]
                .addEventListener("click", deleteTicketType_openConfirm_1);
            var licenceFee = obj.licenceFee;
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
                "<input class=\"is-licence-fee\" name=\"ticketType_licenceFee\" type=\"hidden\" value=\"" + licenceFee + "\" />" +
                "<span>$ " + licenceFee + "</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<input name=\"ticketType_manufacturerLocationID\" type=\"hidden\" value=\"\" />" +
                "<span><span class=\"has-text-grey\">(Not Set)</span><span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
                "<button class=\"button is-small is-amend-ticket-type-manufacturer-button\"" +
                " data-tooltip=\"Change Manufacturer\" type=\"button\">" +
                "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Change Manufacturer</span>" +
                "</button>" +
                "</td>");
            trEle.getElementsByClassName("is-amend-ticket-type-manufacturer-button")[0]
                .addEventListener("click", amendManufacturer_openModal_1);
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<input name=\"ticketType_distributorLocationID\" type=\"hidden\" value=\"\" />" +
                "<span><span class=\"has-text-grey\">(Not Set)</span><span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-hidden-print\">" +
                "<button class=\"button is-small is-amend-ticket-type-distributor-button\"" +
                " data-tooltip=\"Change Distributor\" type=\"button\">" +
                "<i class=\"fas fa-pencil-alt\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Change Distributor</span>" +
                "</button>" +
                "</td>");
            trEle.getElementsByClassName("is-amend-ticket-type-distributor-button")[0]
                .addEventListener("click", amendDistributor_openModal_1);
            ticketTypesPanelEle.getElementsByTagName("tbody")[0].insertAdjacentElement("afterbegin", trEle);
            ticketTypes_calculateTfoot_1();
            setUnsavedChanges();
            setDoRefreshAfterSave();
        };
        {
            ticketTypes_calculateTfoot_1();
            document.getElementById("is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);
            var amendUnitButtonEles = ticketTypesPanelEle.getElementsByClassName("is-amend-ticket-type-unit-count-button");
            for (var buttonIndex = 0; buttonIndex < amendUnitButtonEles.length; buttonIndex += 1) {
                amendUnitButtonEles[buttonIndex].addEventListener("click", amendUnitCount_openModal_1);
            }
            var deleteButtonEles = ticketTypesPanelEle.getElementsByClassName("is-delete-ticket-type-button");
            for (var buttonIndex = 0; buttonIndex < deleteButtonEles.length; buttonIndex += 1) {
                deleteButtonEles[buttonIndex].addEventListener("click", deleteTicketType_openConfirm_1);
            }
            var amendDistributorButtonEles = ticketTypesPanelEle.getElementsByClassName("is-amend-ticket-type-distributor-button");
            for (var buttonIndex = 0; buttonIndex < amendDistributorButtonEles.length; buttonIndex += 1) {
                amendDistributorButtonEles[buttonIndex].addEventListener("click", amendDistributor_openModal_1);
            }
            var amendManufacturerButtonEles = ticketTypesPanelEle.getElementsByClassName("is-amend-ticket-type-manufacturer-button");
            for (var buttonIndex = 0; buttonIndex < amendManufacturerButtonEles.length; buttonIndex += 1) {
                amendManufacturerButtonEles[buttonIndex].addEventListener("click", amendManufacturer_openModal_1);
            }
        }
    }
    if (!isCreate) {
        var updateFeeButtonEle_1 = document.getElementById("is-update-expected-licence-fee-button");
        if (updateFeeButtonEle_1) {
            updateFeeButtonEle_1.addEventListener("click", function () {
                var licenceFeeEle = document.getElementById("licence--licenceFee");
                licenceFeeEle.value = updateFeeButtonEle_1.getAttribute("data-licence-fee-expected");
                licenceFeeEle.classList.remove("is-danger");
                licenceFeeEle.closest(".field").getElementsByClassName("help")[0].remove();
                updateFeeButtonEle_1.remove();
                setUnsavedChanges();
                setDoRefreshAfterSave();
            });
        }
        document.getElementById("is-add-transaction-button").addEventListener("click", function () {
            var addTransactionFormEle;
            var addTransactionFn = function (formEvent) {
                if (formEvent) {
                    formEvent.preventDefault();
                }
                cityssm.postJSON("/licences/doAddTransaction", addTransactionFormEle, function (responseJSON) {
                    if (responseJSON.success) {
                        window.location.reload(true);
                    }
                });
            };
            cityssm.openHtmlModal("licence-transactionAdd", {
                onshow: function (modalEle) {
                    llm.getDefaultConfigProperty("externalReceiptNumber_fieldLabel", function (fieldLabel) {
                        modalEle.querySelector("label[for='transactionAdd--externalReceiptNumber']").innerText = fieldLabel;
                    });
                    document.getElementById("transactionAdd--licenceID").value = licenceID;
                    var licenceFee = parseFloat(document.getElementById("licence--licenceFee").value);
                    var transactionTotalEle = document.getElementById("licence--transactionTotal");
                    var transactionTotal = parseFloat(transactionTotalEle ? transactionTotalEle.innerText : "0");
                    document.getElementById("transactionAdd--licenceFee").innerText = licenceFee.toFixed(2);
                    document.getElementById("transactionAdd--transactionTotal").innerText = transactionTotal.toFixed(2);
                    var discrepancy = (licenceFee - transactionTotal).toFixed(2);
                    document.getElementById("transactionAdd--discrepancy").innerText = discrepancy;
                    document.getElementById("transactionAdd--transactionAmount").value = discrepancy;
                    addTransactionFormEle = modalEle.getElementsByTagName("form")[0];
                    addTransactionFormEle.addEventListener("submit", addTransactionFn);
                    if (!isIssued) {
                        var addAndIssueButtonEle = document.getElementById("is-add-transaction-issue-licence-button");
                        addAndIssueButtonEle.classList.remove("is-hidden");
                        addAndIssueButtonEle.addEventListener("click", function () {
                            document.getElementById("transactionAdd--issueLicence").value = "true";
                            addTransactionFn();
                        });
                    }
                }
            });
        });
        var voidTransactionButtonEle_1 = document.getElementById("is-void-transaction-button");
        if (voidTransactionButtonEle_1) {
            voidTransactionButtonEle_1.addEventListener("click", function () {
                if (hasUnsavedChanges) {
                    cityssm.alertModal("Unsaved Changes", "Please save all unsaved changes before issuing this licence.", "OK", "warning");
                    return;
                }
                var voidFn = function () {
                    cityssm.postJSON("/licences/doVoidTransaction", {
                        licenceID: licenceID,
                        transactionIndex: voidTransactionButtonEle_1.getAttribute("data-transaction-index")
                    }, function (responseJSON) {
                        if (responseJSON.success) {
                            window.location.reload(true);
                        }
                    });
                };
                var reverseTransactionAmount = (parseFloat(voidTransactionButtonEle_1.getAttribute("data-transaction-amount")) * -1).toFixed(2);
                cityssm.confirmModal("Void Transaction?", "<strong>Are you sure you want to void this transaction?</strong><br />" +
                    "If the history of this transaction should be maintained," +
                    " it may be preferred to create a new transaction for $ " + reverseTransactionAmount + ".", "Void Transaction", "warning", voidFn);
            });
        }
    }
    if (!isCreate) {
        var unissueLicenceButtonEle = document.getElementById("is-unissue-licence-button");
        if (unissueLicenceButtonEle) {
            unissueLicenceButtonEle.addEventListener("click", function () {
                var unissueFn = function () {
                    cityssm.postJSON("/licences/doUnissueLicence", {
                        licenceID: licenceID
                    }, function (responseJSON) {
                        if (responseJSON.success) {
                            window.location.reload(true);
                        }
                    });
                };
                cityssm.confirmModal("Unissue Licence?", "Are you sure you want to unissue this lottery licence?", "Yes, Unissue", "danger", unissueFn);
            });
        }
        else {
            var issueLicenceFn = function () {
                var issueFn = function () {
                    cityssm.postJSON("/licences/doIssueLicence", {
                        licenceID: licenceID
                    }, function (responseJSON) {
                        if (responseJSON.success) {
                            window.location.reload(true);
                        }
                    });
                };
                if (hasUnsavedChanges) {
                    cityssm.alertModal("Unsaved Changes", "Please save all unsaved changes before issuing this licence.", "OK", "warning");
                }
                else {
                    cityssm.confirmModal("Issue Licence?", "Are you sure you want to issue this lottery licence?", "Yes, Issue", "success", issueFn);
                }
            };
            document.getElementById("is-issue-licence-button").addEventListener("click", issueLicenceFn);
            document.getElementById("is-not-issued-tag").addEventListener("dblclick", issueLicenceFn);
        }
    }
}());
