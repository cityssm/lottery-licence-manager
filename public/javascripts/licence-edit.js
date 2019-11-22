/* global window, document */
/* global bulmaCalendar */


(function() {
"use strict";

  // initialize organization lookup

  const organizationLookupModalEle = document.getElementsByClassName("is-organization-lookup-modal")[0];

  document.getElementsByClassName("is-organization-lookup-button")[0].addEventListener("click", function() {
    window.llm.showModal(organizationLookupModalEle);
  });

  const cancelButtonEles = organizationLookupModalEle.getElementsByClassName("is-cancel-button");

  for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {
    cancelButtonEles[buttonIndex].addEventListener("click", window.llm.hideModal);
  }


  // initialize calendars

  bulmaCalendar.attach("[type='date']", window.llm.bulmaCalendarOptions);
  window.llm.fixBulmaCalendars();
}());
