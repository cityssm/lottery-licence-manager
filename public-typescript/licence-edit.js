"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");
    const formEle = document.getElementById("form--licence");
    const formMessageEle = document.getElementById("container--form-message");
    const licenceID = document.getElementById("licence--licenceID").value;
    const isCreate = licenceID === "";
    const isIssued = formEle.getAttribute("data-licence-is-issued") === "true";
    const refreshInputTypes = ["number", "date", "time"];
    let doRefreshAfterSave = false;
    let hasUnsavedChanges = false;
    const eventsContainerEle = document.getElementById("container--events");
    formEle.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
        const eventDateInputEles = eventsContainerEle.getElementsByTagName("input");
        if (eventDateInputEles.length === 0) {
            cityssm.alertModal("Event Date Error", "Please ensure there is at least one event date.", "OK", "warning");
            return;
        }
        formMessageEle.innerHTML = "Saving... <i class=\"fas fa-circle-notch fa-spin\" aria-hidden=\"true\"></i>";
        cityssm.postJSON(urlPrefix + "/licences/doSave", formEle, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.disableNavBlocker();
                hasUnsavedChanges = false;
            }
            if (responseJSON.success && isCreate) {
                window.location.href = urlPrefix + "/licences/" + responseJSON.licenceID.toString() + "/edit";
            }
            else if (responseJSON.success && doRefreshAfterSave) {
                window.location.reload();
            }
            else {
                formMessageEle.innerHTML = "";
                cityssm.alertModal(responseJSON.message, "", "OK", responseJSON.success ? "success" : "danger");
                const removeInputEles = document.getElementsByClassName("is-removed-after-save");
                for (const removeInputEle of removeInputEles) {
                    removeInputEle.remove();
                }
            }
        });
    });
    if (!isCreate) {
        document.getElementById("is-delete-licence-button").addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            const deleteFn = () => {
                cityssm.postJSON(urlPrefix + "/licences/doDelete", {
                    licenceID
                }, (responseJSON) => {
                    if (responseJSON.success) {
                        cityssm.disableNavBlocker();
                        window.location.href = urlPrefix + "/licences";
                    }
                });
            };
            cityssm.confirmModal("Delete Licence?", "Are you sure you want to delete this licence and all events associated with it?", "Yes, Delete", "danger", deleteFn);
        });
    }
    const setDoRefreshAfterSaveFn = () => {
        doRefreshAfterSave = true;
    };
    const setUnsavedChangesFn = (changeEvent) => {
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
            const currentTargetType = (changeEvent.currentTarget instanceof HTMLInputElement ? changeEvent.currentTarget.type : "");
            if (refreshInputTypes.includes(currentTargetType)) {
                setDoRefreshAfterSaveFn();
            }
        }
    };
    const inputEles = formEle.querySelectorAll("input, select, textarea");
    for (const inputEle of inputEles) {
        if (inputEle.name !== "") {
            inputEle.addEventListener("change", setUnsavedChangesFn);
        }
    }
    const externalLicenceNumberUnlockBtnEle = document.getElementById("is-external-licence-number-unlock-button");
    if (externalLicenceNumberUnlockBtnEle) {
        externalLicenceNumberUnlockBtnEle.addEventListener("click", () => {
            const externalLicenceNumberEle = document.getElementById("licence--externalLicenceNumber");
            externalLicenceNumberEle.classList.remove("is-readonly");
            externalLicenceNumberEle.removeAttribute("readonly");
            externalLicenceNumberEle.focus();
        });
    }
    {
        let organizationList = [];
        let organizationLookupCloseModalFn;
        let organizationLookupSearchStrEle;
        let organizationLookupResultsEle;
        const organizationLookupFn_setOrganization = (clickEvent) => {
            clickEvent.preventDefault();
            const organizationEle = clickEvent.currentTarget;
            document.getElementById("licence--organizationID").value =
                organizationEle.getAttribute("data-organization-id");
            document.getElementById("licence--organizationName").value =
                organizationEle.getAttribute("data-organization-name");
            organizationLookupCloseModalFn();
            setUnsavedChangesFn();
        };
        const organizationLookupFn_refreshResults = () => {
            const listEle = document.createElement("div");
            listEle.className = "panel";
            const searchStringSplit = organizationLookupSearchStrEle.value
                .trim()
                .toLowerCase()
                .split(" ");
            let displayLimit = 10;
            for (const organizationObj of organizationList) {
                if (displayLimit < 0) {
                    break;
                }
                let doDisplayRecord = true;
                if (!organizationObj.isEligibleForLicences) {
                    continue;
                }
                const organizationName = organizationObj.organizationName.toLowerCase();
                for (const searchStringPiece of searchStringSplit) {
                    if (!organizationName.includes(searchStringPiece)) {
                        doDisplayRecord = false;
                        break;
                    }
                }
                if (doDisplayRecord) {
                    displayLimit -= 1;
                    const listItemEle = document.createElement("a");
                    listItemEle.className = "panel-block is-block";
                    listItemEle.setAttribute("data-organization-id", organizationObj.organizationID.toString());
                    listItemEle.setAttribute("data-organization-name", organizationObj.organizationName);
                    listItemEle.setAttribute("href", "#");
                    listItemEle.innerHTML = cityssm.escapeHTML(organizationObj.organizationName) + "<br />" +
                        "<span class=\"is-size-7\">" +
                        "<span class=\"icon\"><i class=\"fas fa-user\" aria-hidden=\"true\"></i></span> " +
                        (organizationObj.representativeName
                            ? cityssm.escapeHTML(organizationObj.representativeName)
                            : "<span class=\"has-text-grey\">(No Representative)</span>") +
                        "</span>";
                    listItemEle.addEventListener("click", organizationLookupFn_setOrganization);
                    listEle.appendChild(listItemEle);
                }
            }
            cityssm.clearElement(organizationLookupResultsEle);
            organizationLookupResultsEle.insertAdjacentElement("beforeend", listEle);
        };
        const organizationLookupFn_openModal = () => {
            cityssm.openHtmlModal("licence-organizationLookup", {
                onshow() {
                    organizationLookupSearchStrEle =
                        document.getElementById("organizationLookup--searchStr");
                    organizationLookupSearchStrEle.addEventListener("keyup", organizationLookupFn_refreshResults);
                    organizationLookupResultsEle = document.getElementById("container--organizationLookup");
                    if (organizationList.length === 0) {
                        cityssm.postJSON(urlPrefix + "/organizations/doGetAll", null, (organizationListRes) => {
                            organizationList = organizationListRes;
                            organizationLookupSearchStrEle.removeAttribute("disabled");
                            organizationLookupFn_refreshResults();
                            organizationLookupSearchStrEle.focus();
                        });
                    }
                    else {
                        organizationLookupSearchStrEle.removeAttribute("disabled");
                        organizationLookupFn_refreshResults();
                        organizationLookupSearchStrEle.focus();
                    }
                },
                onshown(_modalEle, closeModalFn) {
                    organizationLookupCloseModalFn = closeModalFn;
                    organizationLookupSearchStrEle.focus();
                },
                onremoved() {
                    document.getElementById("is-organization-lookup-button").focus();
                }
            });
        };
        document.getElementById("is-organization-lookup-button").addEventListener("click", organizationLookupFn_openModal);
        document.getElementById("licence--organizationName").addEventListener("dblclick", organizationLookupFn_openModal);
    }
    let locationList = [];
    const loadLocationListFn = (callbackFn) => {
        if (locationList.length === 0) {
            cityssm.postJSON(urlPrefix + "/locations/doGetLocations", null, (locationResults) => {
                locationList = locationResults.locations;
                callbackFn();
            });
        }
        else {
            callbackFn();
        }
    };
    {
        let locationLookup_closeModalFn;
        let locationLookup_searchStrEle;
        let locationLookup_resultsEle;
        const locationLookupFn_setLocation = (locationID, locationDisplayName) => {
            document.getElementById("licence--locationID").value = locationID.toString();
            document.getElementById("licence--locationDisplayName").value = locationDisplayName;
        };
        const locationLookupFn_setLocationFromExisting = (clickEvent) => {
            clickEvent.preventDefault();
            const locationEle = clickEvent.currentTarget;
            locationLookupFn_setLocation(parseInt(locationEle.getAttribute("data-location-id"), 10), locationEle.getAttribute("data-location-display-name"));
            locationLookup_closeModalFn();
            setUnsavedChangesFn();
        };
        const locationLookupFn_refreshResults = () => {
            const listEle = document.createElement("div");
            listEle.className = "panel";
            const searchStringSplit = locationLookup_searchStrEle.value
                .trim()
                .toLowerCase()
                .split(" ");
            let displayLimit = 10;
            for (const locationObj of locationList) {
                if (displayLimit <= 0) {
                    break;
                }
                let doDisplayRecord = true;
                const locationName = locationObj.locationName.toLowerCase();
                for (const searchStringPiece of searchStringSplit) {
                    if (!locationName.includes(searchStringPiece)) {
                        doDisplayRecord = false;
                        break;
                    }
                }
                if (doDisplayRecord) {
                    displayLimit -= 1;
                    const listItemEle = document.createElement("a");
                    listItemEle.className = "panel-block is-block";
                    listItemEle.setAttribute("data-location-id", locationObj.locationID.toString());
                    listItemEle.setAttribute("data-location-display-name", locationObj.locationDisplayName);
                    listItemEle.setAttribute("href", "#");
                    listItemEle.innerHTML = "<div class=\"columns\">" +
                        "<div class=\"column is-narrow\">" +
                        "<i class=\"fas fa-map-marker-alt\" aria-hidden=\"true\"></i>" +
                        "</div>" +
                        "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationDisplayName) + "</div>" +
                        (locationObj.locationName === ""
                            ? ""
                            : "<div class=\"column\">" + cityssm.escapeHTML(locationObj.locationAddress1) + "</div>") +
                        "</div>";
                    listItemEle.addEventListener("click", locationLookupFn_setLocationFromExisting);
                    listEle.insertAdjacentElement("beforeend", listItemEle);
                }
            }
            cityssm.clearElement(locationLookup_resultsEle);
            locationLookup_resultsEle.insertAdjacentElement("beforeend", listEle);
        };
        const locationLookupFn_openModal = () => {
            cityssm.openHtmlModal("licence-locationLookup", {
                onshow(modalEle) {
                    locationLookup_searchStrEle = document.getElementById("locationLookup--searchStr");
                    locationLookup_searchStrEle.addEventListener("keyup", locationLookupFn_refreshResults);
                    locationLookup_resultsEle = document.getElementById("container--locationLookup");
                    loadLocationListFn(() => {
                        locationLookup_searchStrEle.removeAttribute("disabled");
                        locationLookupFn_refreshResults();
                        locationLookup_searchStrEle.focus();
                    });
                    llm.getDefaultConfigProperty("city", (defaultCity) => {
                        if (defaultCity) {
                            document.getElementById("newLocation--locationCity").value = defaultCity;
                        }
                    });
                    llm.getDefaultConfigProperty("province", (defaultProvince) => {
                        if (defaultProvince) {
                            document.getElementById("newLocation--locationProvince").value = defaultProvince;
                        }
                    });
                    document.getElementById("form--newLocation").addEventListener("submit", (formEvent) => {
                        formEvent.preventDefault();
                        cityssm.postJSON(urlPrefix + "/locations/doCreate", formEvent.currentTarget, (responseJSON) => {
                            if (responseJSON.success) {
                                locationList = [];
                                locationLookupFn_setLocation(responseJSON.locationID, responseJSON.locationDisplayName);
                                locationLookup_closeModalFn();
                            }
                        });
                    });
                    llm.initializeTabs(modalEle.querySelector(".tabs ul"));
                },
                onshown(_modalEle, closeModalFn) {
                    locationLookup_closeModalFn = closeModalFn;
                    locationLookup_searchStrEle.focus();
                },
                onremoved() {
                    document.getElementById("is-location-lookup-button").focus();
                }
            });
        };
        document.getElementById("is-location-lookup-button").addEventListener("click", locationLookupFn_openModal);
        document.getElementById("licence--locationDisplayName").addEventListener("dblclick", locationLookupFn_openModal);
    }
    document.getElementById("is-endDateString-year-button").addEventListener("click", () => {
        const startDateStringSplit = document.getElementById("licence--startDateString").value.split("-");
        const dateObj = new Date(parseInt(startDateStringSplit[0], 10) + 1, parseInt(startDateStringSplit[1], 10) - 1, parseInt(startDateStringSplit[2]));
        const endDateString = dateObj.getFullYear().toString() + "-" +
            ("00" + (dateObj.getMonth() + 1).toString()).slice(-2) + "-" +
            ("00" + dateObj.getDate().toString()).slice(-2);
        document.getElementById("licence--endDateString").value = endDateString;
        setUnsavedChangesFn();
        setDoRefreshAfterSaveFn();
    });
    {
        let termsConditionsList = [];
        const termsConditionsLookupModalEle = document.getElementById("is-termsConditions-lookup-modal");
        const termsConditionsLookupResultsEle = document.getElementById("container--termsConditionsPrevious");
        const termsConditionsLookupFn_setTermsConditions = (clickEvent) => {
            clickEvent.preventDefault();
            const termsConditionsIndex = parseInt(clickEvent.currentTarget.getAttribute("data-terms-conditions-index"), 10);
            const termsConditionsEle = document.getElementById("licence--termsConditions");
            termsConditionsEle.value = termsConditionsList[termsConditionsIndex].termsConditions;
            cityssm.hideModal(termsConditionsLookupModalEle);
            termsConditionsEle.focus();
            setUnsavedChangesFn();
        };
        document.getElementById("is-termsConditions-lookup-button").addEventListener("click", () => {
            termsConditionsList = [];
            cityssm.clearElement(termsConditionsLookupResultsEle);
            const organizationID = document.getElementById("licence--organizationID").value;
            if (organizationID === "") {
                cityssm.alertModal("No Organization Selected", "An organization must be selected before the previously used terms and conditions can be retrieved.", "OK", "warning");
                return;
            }
            termsConditionsLookupResultsEle.innerHTML = "<p class=\"has-text-centered has-text-grey-lighter\">" +
                "<i class=\"fas fa-3x fa-circle-notch fa-spin\" aria-hidden=\"true\"></i><br />" +
                "Loading previously used terms and conditions..." +
                "</p>";
            cityssm.postJSON(urlPrefix + "/licences/doGetDistinctTermsConditions", {
                organizationID
            }, (termsConditionsListRes) => {
                termsConditionsList = termsConditionsListRes;
                if (termsConditionsList.length === 0) {
                    termsConditionsLookupResultsEle.innerHTML = "<p class=\"has-text-centered\">" +
                        "No previously used terms and conditions found for this organization." +
                        "</p>";
                }
                else {
                    const listEle = document.createElement("div");
                    listEle.className = "panel mb-3";
                    termsConditionsList.forEach((termsConditionsObj, termsConditionsIndex) => {
                        const listItemEle = document.createElement("a");
                        listItemEle.className = "panel-block is-block";
                        listItemEle.setAttribute("data-terms-conditions-index", termsConditionsIndex.toString());
                        listItemEle.innerHTML = "<p class=\"has-newline-chars\">" +
                            cityssm.escapeHTML(termsConditionsObj.termsConditions) +
                            "</p>" +
                            "<p class=\"has-text-right\">" +
                            (termsConditionsObj.termsConditionsCount > 1
                                ? "<span class=\"tag is-light has-tooltip-left\" data-tooltip=\"Included on Multiple Licences\">" +
                                    "<span class=\"icon\"><i class=\"fas fa-star\" aria-hidden=\"true\"></i></span>" +
                                    " <span>Used " + termsConditionsObj.termsConditionsCount.toString() + " times</span>" +
                                    "</span>"
                                : "") +
                            (termsConditionsObj.isIssued >= 1
                                ? "<span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Included on an Issued Licence\">" +
                                    "<span class=\"icon\"><i class=\"fas fa-stamp\" aria-hidden=\"true\"></i></span>" +
                                    " <span>Issued</span>" +
                                    "</span>"
                                : "") +
                            " <span class=\"tag is-info has-tooltip-left\" data-tooltip=\"Most Recent Licence Start Date\">" +
                            "<span class=\"icon\"><i class=\"fas fa-calendar\" aria-hidden=\"true\"></i></span>" +
                            " <span>" + termsConditionsObj.startDateMaxString + "</span>" +
                            "</span>" +
                            "</p>";
                        listItemEle.addEventListener("click", termsConditionsLookupFn_setTermsConditions);
                        listEle.insertAdjacentElement("beforeend", listItemEle);
                    });
                    cityssm.clearElement(termsConditionsLookupResultsEle);
                    termsConditionsLookupResultsEle.insertAdjacentElement("beforeend", listEle);
                }
            });
            cityssm.showModal(termsConditionsLookupModalEle);
        });
        const cancelButtonEles = termsConditionsLookupModalEle.getElementsByClassName("is-close-modal-button");
        for (const cancelButtonEle of cancelButtonEles) {
            cancelButtonEle.addEventListener("click", cityssm.hideModal);
        }
    }
    const licenceType_selectEle = document.getElementById("licence--licenceTypeKey");
    if (isCreate) {
        const licenceType_fieldContainerEles = document.getElementsByClassName("container-licenceTypeFields");
        const changeFn_licenceType = () => {
            const optionEle = licenceType_selectEle.selectedOptions[0];
            const totalPrizeValueMax = optionEle.getAttribute("data-total-prize-value-max");
            document.getElementById("licence--totalPrizeValue").setAttribute("max", totalPrizeValueMax);
            const hasTicketTypes = optionEle.getAttribute("data-has-ticket-types") === "true";
            const totalPrizeValueEle = document.getElementById("licence--totalPrizeValue");
            if (hasTicketTypes) {
                document.getElementById("is-ticket-types-panel").classList.remove("is-hidden");
                totalPrizeValueEle.setAttribute("readonly", "readonly");
                totalPrizeValueEle.classList.add("is-readonly");
            }
            else {
                const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");
                ticketTypesPanelEle.classList.add("is-hidden");
                cityssm.clearElement(ticketTypesPanelEle.getElementsByTagName("tbody")[0]);
                cityssm.clearElement(ticketTypesPanelEle.getElementsByTagName("tfoot")[0]);
                totalPrizeValueEle.removeAttribute("readonly");
                totalPrizeValueEle.classList.remove("is-readonly");
            }
            const licenceTypeKey = licenceType_selectEle.value;
            const idToShow = "container-licenceTypeFields--" + licenceTypeKey;
            for (const fieldContainerEle of licenceType_fieldContainerEles) {
                if (fieldContainerEle.id === idToShow) {
                    fieldContainerEle.removeAttribute("disabled");
                    fieldContainerEle.classList.remove("is-hidden");
                }
                else {
                    fieldContainerEle.classList.add("is-hidden");
                    fieldContainerEle.setAttribute("disabled", "disabled");
                }
            }
        };
        licenceType_selectEle.addEventListener("change", changeFn_licenceType);
    }
    {
        const startDateEle = document.getElementById("licence--startDateString");
        const endDateEle = document.getElementById("licence--endDateString");
        const dateFn_setMin = () => {
            const startDateString = startDateEle.value;
            endDateEle.setAttribute("min", startDateString);
            if (endDateEle.value < startDateString) {
                endDateEle.value = startDateString;
            }
            const eventDateEles = eventsContainerEle.getElementsByTagName("input");
            for (const eventDateEle of eventDateEles) {
                eventDateEle.setAttribute("min", startDateString);
            }
        };
        const dateFn_setMax = () => {
            const endDateString = endDateEle.value;
            const eventDateEles = eventsContainerEle.getElementsByTagName("input");
            for (const eventDateEle of eventDateEles) {
                eventDateEle.setAttribute("max", endDateString);
            }
        };
        document.getElementById("licence--applicationDateString").addEventListener("change", (changeEvent) => {
            startDateEle.setAttribute("min", changeEvent.currentTarget.value);
        });
        startDateEle.addEventListener("change", dateFn_setMin);
        endDateEle.addEventListener("change", dateFn_setMax);
        const eventFn_remove = (clickEvent) => {
            clickEvent.currentTarget.closest(".panel-block").remove();
            doRefreshAfterSave = true;
            setUnsavedChangesFn();
        };
        const eventFn_add = (eventDate) => {
            let eventDateString = "";
            if (eventDate) {
                if (eventDate instanceof Date) {
                    eventDateString = eventDate.getFullYear().toString() + "-" +
                        ("00" + (eventDate.getMonth() + 1).toString()).slice(-2) + "-" +
                        ("00" + eventDate.getDate().toString()).slice(-2);
                }
                else if (eventDate.constructor === String) {
                    eventDateString = eventDate;
                }
                else if (eventDate instanceof Event) {
                    try {
                        eventDate.preventDefault();
                        const sourceEleID = eventDate.currentTarget.getAttribute("data-source");
                        eventDateString = document.getElementById(sourceEleID).value;
                    }
                    catch (_e) {
                    }
                }
            }
            eventsContainerEle.insertAdjacentHTML("beforeend", "<div class=\"panel-block is-block\">" +
                "<div class=\"field has-addons\">" +
                ("<div class=\"control is-expanded has-icons-left\">" +
                    "<input class=\"input is-small input--eventDateString\" name=\"eventDateString\" type=\"date\"" +
                    " value=\"" + cityssm.escapeHTML(eventDateString) + "\"" +
                    " min=\"" + cityssm.escapeHTML(startDateEle.value) + "\"" +
                    " max=\"" + cityssm.escapeHTML(endDateEle.value) + "\"" +
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
            const buttonEles = eventsContainerEle.getElementsByTagName("a");
            buttonEles[buttonEles.length - 1].addEventListener("click", eventFn_remove);
            doRefreshAfterSave = true;
            setUnsavedChangesFn();
        };
        const eventCalculator_modalEle = document.getElementById("is-event-calculator-modal");
        document.getElementsByClassName("is-calculate-events-button")[0].addEventListener("click", () => {
            const eventCount = parseInt(document.getElementById("eventCalc--eventCount").value, 10);
            const dayInterval = parseInt(document.getElementById("eventCalc--dayInterval").value, 10);
            let dateSplit = endDateEle.value.split("-");
            const endDate = new Date(parseInt(dateSplit[0], 10), parseInt(dateSplit[1], 10) - 1, parseInt(dateSplit[2], 10));
            dateSplit = startDateEle.value.split("-");
            const eventDate = new Date(parseInt(dateSplit[0], 10), parseInt(dateSplit[1], 10) - 1, parseInt(dateSplit[2], 10));
            for (let eventNum = 0; eventNum < eventCount && eventDate.getTime() <= endDate.getTime(); eventNum += 1) {
                eventFn_add(eventDate);
                eventDate.setDate(eventDate.getDate() + dayInterval);
            }
            cityssm.hideModal(eventCalculator_modalEle);
        });
        document.getElementById("is-event-calculator-button").addEventListener("click", () => {
            cityssm.showModal(eventCalculator_modalEle);
        });
        const cancelButtonEles = eventCalculator_modalEle.getElementsByClassName("is-close-modal-button");
        for (const cancelButtonEle of cancelButtonEles) {
            cancelButtonEle.addEventListener("click", cityssm.hideModal);
        }
        const addEventBtnEles = document.getElementsByClassName("is-add-event-button");
        for (const addEventBtnEle of addEventBtnEles) {
            addEventBtnEle.addEventListener("click", eventFn_add);
        }
    }
    const ticketTypesPanelEle = document.getElementById("is-ticket-types-panel");
    if (ticketTypesPanelEle) {
        const cache_licenceTypeKeyToTicketTypes = new Map();
        const cacheFn_loadTicketTypes = (callbackFn) => {
            const licenceTypeKey = licenceType_selectEle.value;
            if (cache_licenceTypeKeyToTicketTypes.has(licenceTypeKey)) {
                callbackFn(cache_licenceTypeKeyToTicketTypes.get(licenceTypeKey));
            }
            else {
                cityssm.postJSON(urlPrefix + "/licences/doGetTicketTypes", {
                    licenceTypeKey
                }, (ticketTypes) => {
                    cache_licenceTypeKeyToTicketTypes.set(licenceTypeKey, ticketTypes);
                    callbackFn(ticketTypes);
                });
            }
        };
        const cache_distributorLocations = [];
        let cache_distributorLocations_idToName;
        const cache_manufacturerLocations = [];
        let cache_manufacturerLocations_idToName;
        const cacheFn_loadDistributorLocations = (callbackFn) => {
            if (cache_distributorLocations.length === 0) {
                loadLocationListFn(() => {
                    cache_distributorLocations_idToName = new Map();
                    for (const location of locationList) {
                        if (location.locationIsDistributor) {
                            cache_distributorLocations.push(location);
                            cache_distributorLocations_idToName.set(location.locationID, location.locationDisplayName);
                        }
                    }
                    callbackFn(cache_distributorLocations);
                });
            }
            else {
                callbackFn(cache_distributorLocations);
            }
        };
        const cacheFn_loadManufacturerLocations = (callbackFn) => {
            if (cache_manufacturerLocations.length === 0) {
                loadLocationListFn(() => {
                    cache_manufacturerLocations_idToName = new Map();
                    for (const location of locationList) {
                        if (location.locationIsManufacturer) {
                            cache_manufacturerLocations.push(location);
                            cache_manufacturerLocations_idToName.set(location.locationID, location.locationDisplayName);
                        }
                    }
                    callbackFn(cache_manufacturerLocations);
                });
            }
            else {
                callbackFn(cache_manufacturerLocations);
            }
        };
        const summaryTableEle = document.getElementById("ticketTypesTabPanel--summary");
        const summaryTableTbodyEle = summaryTableEle.getElementsByTagName("tbody")[0];
        const summaryTableTFootEle = summaryTableEle.getElementsByTagName("tfoot")[0];
        const logTableEle = document.getElementById("ticketTypesTabPanel--log");
        const logTableTbodyEle = logTableEle.getElementsByTagName("tbody")[0];
        const logTableTFootEle = logTableEle.getElementsByTagName("tfoot")[0];
        let lastUsedDistributorID = "";
        let lastUsedManufacturerID = "";
        if (logTableTbodyEle.getElementsByTagName("tr").length > 0) {
            const trEles = logTableTbodyEle.getElementsByTagName("tr");
            const lastTrEle = trEles[trEles.length - 1];
            lastUsedDistributorID = lastTrEle.getAttribute("data-distributor-id");
            lastUsedManufacturerID = lastTrEle.getAttribute("data-manufacturer-id");
        }
        const summaryTableFn_renderTable = () => {
            const ticketTypeTotals = new Map();
            const logTrEles = logTableTbodyEle.getElementsByTagName("tr");
            for (const logTrEle of logTrEles) {
                const ticketType = logTrEle.getAttribute("data-ticket-type");
                let totalUnits = parseInt(logTrEle.getAttribute("data-unit-count"), 10);
                let totalValue = parseFloat(logTrEle.getAttribute("data-total-value"));
                let totalPrizes = parseFloat(logTrEle.getAttribute("data-total-prizes"));
                let totalLicenceFee = parseFloat(logTrEle.getAttribute("data-licence-fee"));
                if (ticketTypeTotals.has(ticketType)) {
                    totalUnits += ticketTypeTotals.get(ticketType).totalUnits;
                    totalValue += ticketTypeTotals.get(ticketType).totalValue;
                    totalPrizes += ticketTypeTotals.get(ticketType).totalPrizes;
                    totalLicenceFee += ticketTypeTotals.get(ticketType).totalLicenceFee;
                }
                ticketTypeTotals.set(ticketType, {
                    totalUnits,
                    totalValue,
                    totalPrizes,
                    totalLicenceFee
                });
            }
            const ticketTypes = [];
            for (const ticketType of ticketTypeTotals.keys()) {
                ticketTypes.push(ticketType);
            }
            ticketTypes.sort();
            cityssm.clearElement(summaryTableTbodyEle);
            const grandTotals = {
                totalUnits: 0,
                totalValue: 0,
                totalPrizes: 0,
                totalLicenceFee: 0
            };
            for (const ticketType of ticketTypes) {
                const rowTotals = ticketTypeTotals.get(ticketType);
                grandTotals.totalUnits += rowTotals.totalUnits;
                grandTotals.totalValue += rowTotals.totalValue;
                grandTotals.totalPrizes += rowTotals.totalPrizes;
                grandTotals.totalLicenceFee += rowTotals.totalLicenceFee;
                const summaryTrEle = document.createElement("tr");
                summaryTrEle.innerHTML = ("<td>" + ticketType + "</td>") +
                    ("<td class=\"has-text-right\">" + rowTotals.totalUnits.toString() + "</td>") +
                    ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalValue) + "</td>") +
                    ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalPrizes) + "</td>") +
                    ("<td class=\"has-text-right\">" + llm.formatDollarsAsHTML(rowTotals.totalLicenceFee) + "</td>");
                summaryTableTbodyEle.appendChild(summaryTrEle);
            }
            summaryTableTFootEle.innerHTML = "<td></td>" +
                "<th class=\"has-text-right\">" + grandTotals.totalUnits.toString() + "</th>" +
                "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalValue) + "</th>" +
                "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalPrizes) + "</th>" +
                "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalLicenceFee) + "</th>";
            logTableTFootEle.innerHTML = "<td></td>" +
                "<td></td>" +
                "<th class=\"has-text-right\">" + grandTotals.totalUnits.toString() + "</th>" +
                "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalValue) + "</th>" +
                "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalPrizes) + "</th>" +
                "<th class=\"has-text-right\">" + llm.formatDollarsAsHTML(grandTotals.totalLicenceFee) + "</th>" +
                "<td></td>" +
                "<td class=\"is-hidden-print\"></td>";
            document.getElementById("licence--totalPrizeValue").value = grandTotals.totalPrizes.toFixed(2);
        };
        const logTableFn_addTr = (obj) => {
            const ticketType = obj.ticketType;
            const unitCount = obj.unitCount;
            const valuePerDeal = obj.valuePerDeal;
            const totalValuePerDeal = (valuePerDeal * unitCount).toFixed(2);
            const prizesPerDeal = obj.prizesPerDeal;
            const totalPrizesPerDeal = (prizesPerDeal * unitCount).toFixed(2);
            const licenceFee = obj.licenceFee;
            const trEle = document.createElement("tr");
            trEle.className = "has-background-success-light";
            trEle.setAttribute("data-ticket-type-index", "");
            trEle.setAttribute("data-ticket-type", ticketType);
            trEle.setAttribute("data-unit-count", unitCount.toString());
            trEle.setAttribute("data-total-value", totalValuePerDeal.toString());
            trEle.setAttribute("data-total-prizes", totalPrizesPerDeal.toString());
            trEle.setAttribute("data-licence-fee", obj.licenceFee.toString());
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<input name=\"ticketType_ticketTypeIndex\" type=\"hidden\" value=\"\" />" +
                "<input name=\"ticketType_amendmentDate\" type=\"hidden\" value=\"\" />" +
                "<span>(New Record)</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td>" +
                "<input name=\"ticketType_ticketType\" type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketType) + "\" />" +
                "<span>" + cityssm.escapeHTML(ticketType) + "</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right\">" +
                "<input name=\"ticketType_unitCount\" type=\"hidden\" value=\"" + unitCount.toString() + "\" />" +
                "<span>" + unitCount.toString() + "</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
                "<input class=\"is-total-value-per-deal\" type=\"hidden\" value=\"" + totalValuePerDeal.toString() + "\" />" +
                "<span data-tooltip=\"$" + valuePerDeal.toFixed(2) + " value per deal\">$ " + totalValuePerDeal + "</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
                "<input class=\"is-total-prizes-per-deal\" type=\"hidden\" value=\"" + totalPrizesPerDeal.toString() + "\" />" +
                "<span data-tooltip=\"$" + prizesPerDeal.toFixed(2) + " prizes per deal\">" +
                "$" + totalPrizesPerDeal +
                "</span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"has-text-right is-nowrap\">" +
                "<input class=\"is-licence-fee\" name=\"ticketType_licenceFee\"" +
                " type=\"hidden\" value=\"" + licenceFee.toString() + "\" />" +
                "<span>$" + licenceFee.toFixed(2) + "</span>" +
                "</td>");
            const manufacturerLocationDisplayName = cache_manufacturerLocations_idToName.get(obj.manufacturerLocationID);
            const distributorLocationDisplayName = cache_distributorLocations_idToName.get(obj.distributorLocationID);
            lastUsedDistributorID = obj.distributorLocationID.toString();
            lastUsedManufacturerID = obj.manufacturerLocationID.toString();
            trEle.insertAdjacentHTML("beforeend", "<td class=\"is-size-7\">" +
                "<input name=\"ticketType_manufacturerLocationID\" type=\"hidden\" value=\"" + obj.manufacturerLocationID.toString() + "\" />" +
                "<input name=\"ticketType_distributorLocationID\" type=\"hidden\" value=\"" + obj.distributorLocationID.toString() + "\" />" +
                "<span>" + cityssm.escapeHTML(manufacturerLocationDisplayName) + "<span><br />" +
                "<span>" + cityssm.escapeHTML(distributorLocationDisplayName) + "<span>" +
                "</td>");
            trEle.insertAdjacentHTML("beforeend", "<td class=\"is-hidden-print\">" +
                "<button class=\"button is-small is-danger has-tooltip-left is-delete-ticket-type-button\"" +
                " data-tooltip=\"Delete Ticket Type\" type=\"button\">" +
                "<i class=\"fas fa-trash\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Delete</span>" +
                "</button>" +
                "</td>");
            trEle.getElementsByClassName("is-delete-ticket-type-button")[0]
                .addEventListener("click", deleteTicketTypeFn_openConfirm);
            logTableTbodyEle.insertAdjacentElement("afterbegin", trEle);
            summaryTableFn_renderTable();
            setUnsavedChangesFn();
            setDoRefreshAfterSaveFn();
        };
        const deleteTicketTypeFn_openConfirm = (buttonEvent) => {
            const trEle = buttonEvent.currentTarget.closest("tr");
            const ticketType = trEle.getAttribute("data-ticket-type");
            const ticketTypeIndex = trEle.getAttribute("data-ticket-type-index");
            const doDeleteTicketTypeFn = () => {
                trEle.remove();
                if (!isCreate) {
                    formEle.insertAdjacentHTML("beforeend", "<input class=\"is-removed-after-save\" name=\"ticketTypeIndex_toDelete\"" +
                        " type=\"hidden\" value=\"" + cityssm.escapeHTML(ticketTypeIndex) + "\" />");
                }
                summaryTableFn_renderTable();
                setUnsavedChangesFn();
                setDoRefreshAfterSaveFn();
            };
            cityssm.confirmModal("Delete Ticket Type?", "Are you sure you want to remove the " + ticketType + " ticket type for this licence?", "Yes, Delete", "danger", doDeleteTicketTypeFn);
        };
        const addTicketType_openModal = () => {
            let addTicketType_closeModalFn;
            let addTicketType_ticketTypeEle;
            let addTicketType_unitCountEle;
            const addTicketTypeFn_addTicketType = (formEvent) => {
                formEvent.preventDefault();
                logTableFn_addTr({
                    ticketType: document.getElementById("ticketTypeAdd--ticketType").value,
                    unitCount: parseInt(document.getElementById("ticketTypeAdd--unitCount").value, 10),
                    valuePerDeal: parseFloat(document.getElementById("ticketTypeAdd--valuePerDeal").value),
                    prizesPerDeal: parseFloat(document.getElementById("ticketTypeAdd--prizesPerDeal").value),
                    licenceFee: parseFloat(document.getElementById("ticketTypeAdd--licenceFee").value),
                    distributorLocationID: parseInt(document.getElementById("ticketTypeAdd--distributorLocationID").value, 10),
                    manufacturerLocationID: parseInt(document.getElementById("ticketTypeAdd--manufacturerLocationID").value, 10)
                });
                addTicketType_closeModalFn();
            };
            const addTicketTypeFn_refreshUnitCountChange = () => {
                const unitCount = parseInt(addTicketType_unitCountEle.value, 10);
                document.getElementById("ticketTypeAdd--prizesTotal").value =
                    (parseFloat(document.getElementById("ticketTypeAdd--prizesPerDeal").value) * unitCount)
                        .toFixed(2);
                document.getElementById("ticketTypeAdd--licenceFee").value =
                    (parseFloat(document.getElementById("ticketTypeAdd--feePerUnit").value) * unitCount)
                        .toFixed(2);
            };
            const addTicketTypeFn_refreshTicketTypeChange = () => {
                const ticketTypeOptionEle = addTicketType_ticketTypeEle.selectedOptions[0];
                document.getElementById("ticketTypeAdd--ticketPrice").value =
                    ticketTypeOptionEle.getAttribute("data-ticket-price");
                document.getElementById("ticketTypeAdd--ticketCount").value =
                    ticketTypeOptionEle.getAttribute("data-ticket-count");
                document.getElementById("ticketTypeAdd--valuePerDeal").value =
                    (parseFloat(ticketTypeOptionEle.getAttribute("data-ticket-price")) *
                        parseInt(ticketTypeOptionEle.getAttribute("data-ticket-count"), 10))
                        .toFixed(2);
                document.getElementById("ticketTypeAdd--prizesPerDeal").value =
                    ticketTypeOptionEle.getAttribute("data-prizes-per-deal");
                document.getElementById("ticketTypeAdd--feePerUnit").value =
                    ticketTypeOptionEle.getAttribute("data-fee-per-unit");
                addTicketTypeFn_refreshUnitCountChange();
            };
            const addTicketTypeFn_populateTicketTypeSelect = () => {
                cacheFn_loadTicketTypes((ticketTypes) => {
                    if (!ticketTypes || ticketTypes.length === 0) {
                        addTicketType_closeModalFn();
                        cityssm.alertModal("No ticket types available", "", "OK", "danger");
                        return;
                    }
                    addTicketType_ticketTypeEle.innerHTML = "";
                    for (const ticketTypeObj of ticketTypes) {
                        const optionEle = document.createElement("option");
                        optionEle.setAttribute("data-ticket-price", ticketTypeObj.ticketPrice.toFixed(2));
                        optionEle.setAttribute("data-ticket-count", ticketTypeObj.ticketCount.toString());
                        optionEle.setAttribute("data-prizes-per-deal", ticketTypeObj.prizesPerDeal.toFixed(2));
                        optionEle.setAttribute("data-fee-per-unit", (ticketTypeObj.feePerUnit || 0).toFixed(2));
                        optionEle.value = ticketTypeObj.ticketType;
                        optionEle.innerText =
                            ticketTypeObj.ticketType +
                                " (" + ticketTypeObj.ticketCount.toString() + " tickets," +
                                " $" + ticketTypeObj.ticketPrice.toFixed(2) + " each)";
                        addTicketType_ticketTypeEle.insertAdjacentElement("beforeend", optionEle);
                    }
                    addTicketTypeFn_refreshTicketTypeChange();
                });
            };
            const addTicketTypeFn_reduceLocations = (optionsHTML, location) => {
                return optionsHTML + "<option value=\"" + location.locationID.toString() + "\">" +
                    cityssm.escapeHTML(location.locationDisplayName) +
                    "</option>";
            };
            const addTicketTypeFn_populateDistributorSelect = () => {
                cacheFn_loadDistributorLocations((locations) => {
                    const selectEle = document.getElementById("ticketTypeAdd--distributorLocationID");
                    selectEle.innerHTML =
                        locations.reduce(addTicketTypeFn_reduceLocations, "<option value=\"\">(No Distributor)</option>");
                    if (lastUsedDistributorID !== "") {
                        if (selectEle.querySelector("[value='" + lastUsedDistributorID + "']")) {
                            selectEle.value = lastUsedDistributorID;
                        }
                    }
                });
            };
            const addTicketTypeFn_populateManufacturerSelect = () => {
                cacheFn_loadManufacturerLocations((locations) => {
                    const selectEle = document.getElementById("ticketTypeAdd--manufacturerLocationID");
                    selectEle.innerHTML =
                        locations.reduce(addTicketTypeFn_reduceLocations, "<option value=\"\">(No Manufacturer)</option>");
                    if (lastUsedManufacturerID !== "") {
                        if (selectEle.querySelector("[value='" + lastUsedManufacturerID + "']")) {
                            selectEle.value = lastUsedManufacturerID;
                        }
                    }
                });
            };
            cityssm.openHtmlModal("licence-ticketTypeAdd", {
                onshow(modalEle) {
                    addTicketType_ticketTypeEle = document.getElementById("ticketTypeAdd--ticketType");
                    addTicketType_unitCountEle = document.getElementById("ticketTypeAdd--unitCount");
                    addTicketTypeFn_populateDistributorSelect();
                    addTicketTypeFn_populateManufacturerSelect();
                    addTicketTypeFn_populateTicketTypeSelect();
                    addTicketType_ticketTypeEle.addEventListener("change", addTicketTypeFn_refreshTicketTypeChange);
                    addTicketType_unitCountEle.addEventListener("change", addTicketTypeFn_refreshUnitCountChange);
                    modalEle.getElementsByTagName("form")[0].addEventListener("submit", addTicketTypeFn_addTicketType);
                },
                onshown(_modalEle, closeModalFn) {
                    addTicketType_closeModalFn = closeModalFn;
                }
            });
        };
        summaryTableFn_renderTable();
        document.getElementById("is-add-ticket-type-button").addEventListener("click", addTicketType_openModal);
        const deleteButtonEles = ticketTypesPanelEle.getElementsByClassName("is-delete-ticket-type-button");
        for (const deleteButtonEle of deleteButtonEles) {
            deleteButtonEle.addEventListener("click", deleteTicketTypeFn_openConfirm);
        }
    }
    if (!isCreate) {
        const updateFeeButtonEle = document.getElementById("is-update-expected-licence-fee-button");
        if (updateFeeButtonEle) {
            updateFeeButtonEle.addEventListener("click", () => {
                const licenceFeeEle = document.getElementById("licence--licenceFee");
                licenceFeeEle.value = updateFeeButtonEle.getAttribute("data-licence-fee-expected");
                licenceFeeEle.classList.remove("is-danger");
                licenceFeeEle.closest(".field").getElementsByClassName("help")[0].remove();
                updateFeeButtonEle.remove();
                setUnsavedChangesFn();
                setDoRefreshAfterSaveFn();
            });
        }
        document.getElementById("is-add-transaction-button").addEventListener("click", () => {
            let addTransactionFormEle;
            const addTransactionFn = (formEvent) => {
                if (formEvent) {
                    formEvent.preventDefault();
                }
                cityssm.postJSON(urlPrefix + "/licences/doAddTransaction", addTransactionFormEle, (responseJSON) => {
                    if (responseJSON.success) {
                        window.location.reload();
                    }
                });
            };
            cityssm.openHtmlModal("licence-transactionAdd", {
                onshow(modalEle) {
                    llm.getDefaultConfigProperty("externalReceiptNumber_fieldLabel", (fieldLabel) => {
                        modalEle.querySelector("label[for='transactionAdd--externalReceiptNumber']").innerText =
                            fieldLabel;
                    });
                    document.getElementById("transactionAdd--licenceID").value = licenceID;
                    const licenceFee = parseFloat(document.getElementById("licence--licenceFee").value);
                    const transactionTotalEle = document.getElementById("licence--transactionTotal");
                    const transactionTotal = parseFloat(transactionTotalEle ? transactionTotalEle.innerText : "0");
                    document.getElementById("transactionAdd--licenceFee").innerText = licenceFee.toFixed(2);
                    document.getElementById("transactionAdd--transactionTotal").innerText = transactionTotal.toFixed(2);
                    const discrepancy = (licenceFee - transactionTotal).toFixed(2);
                    document.getElementById("transactionAdd--discrepancy").innerText = discrepancy;
                    document.getElementById("transactionAdd--transactionAmount").value = discrepancy;
                    addTransactionFormEle = modalEle.getElementsByTagName("form")[0];
                    addTransactionFormEle.addEventListener("submit", addTransactionFn);
                    if (!isIssued) {
                        const addAndIssueButtonEle = document.getElementById("is-add-transaction-issue-licence-button");
                        addAndIssueButtonEle.classList.remove("is-hidden");
                        addAndIssueButtonEle.addEventListener("click", () => {
                            document.getElementById("transactionAdd--issueLicence").value = "true";
                            addTransactionFn();
                        });
                    }
                }
            });
        });
        const voidTransactionButtonEle = document.getElementById("is-void-transaction-button");
        if (voidTransactionButtonEle) {
            voidTransactionButtonEle.addEventListener("click", () => {
                if (hasUnsavedChanges) {
                    cityssm.alertModal("Unsaved Changes", "Please save all unsaved changes before issuing this licence.", "OK", "warning");
                    return;
                }
                const voidFn = () => {
                    cityssm.postJSON(urlPrefix + "/licences/doVoidTransaction", {
                        licenceID,
                        transactionIndex: voidTransactionButtonEle.getAttribute("data-transaction-index")
                    }, (responseJSON) => {
                        if (responseJSON.success) {
                            window.location.reload();
                        }
                    });
                };
                const reverseTransactionAmount = (parseFloat(voidTransactionButtonEle.getAttribute("data-transaction-amount")) * -1).toFixed(2);
                cityssm.confirmModal("Void Transaction?", "<strong>Are you sure you want to void this transaction?</strong><br />" +
                    "If the history of this transaction should be maintained," +
                    " it may be preferred to create a new transaction for $ " + reverseTransactionAmount + ".", "Void Transaction", "warning", voidFn);
            });
        }
    }
    if (!isCreate) {
        const unissueLicenceButtonEle = document.getElementById("is-unissue-licence-button");
        if (unissueLicenceButtonEle) {
            unissueLicenceButtonEle.addEventListener("click", () => {
                const unissueFn = () => {
                    cityssm.postJSON(urlPrefix + "/licences/doUnissueLicence", {
                        licenceID
                    }, (responseJSON) => {
                        if (responseJSON.success) {
                            window.location.reload();
                        }
                    });
                };
                cityssm.confirmModal("Unissue Licence?", "Are you sure you want to unissue this lottery licence?", "Yes, Unissue", "danger", unissueFn);
            });
        }
        else {
            const issueLicenceFn = () => {
                const issueFn = () => {
                    cityssm.postJSON(urlPrefix + "/licences/doIssueLicence", {
                        licenceID
                    }, (responseJSON) => {
                        if (responseJSON.success) {
                            window.location.reload();
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
})();
