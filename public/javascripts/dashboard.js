"use strict";

(function() {

  const changePasswordModalEles = document.getElementsByClassName("is-change-password-modal");

  if (changePasswordModalEles.length > 0) {

    changePasswordModalEles[0].getElementsByTagName("form")[0].addEventListener("submit", function(formEvent) {

      formEvent.preventDefault();

      const formEle = formEvent.currentTarget;

      llm.postJSON(
        "/dashboard/doChangePassword",
        formEle,
        function(responseJSON) {

          if (responseJSON.success) {

            llm.hideModal(changePasswordModalEles[0]);
            llm.alertModal("Password Updated Successfully", "", "OK", "success");

          }

        }
      );

    });


    document.getElementsByClassName("is-change-password-button")[0].addEventListener("click", function() {

      changePasswordModalEles[0].getElementsByTagName("form")[0].reset();
      llm.showModal(changePasswordModalEles[0]);

    });


    const cancelButtonEles = changePasswordModalEles[0].getElementsByClassName("is-cancel-button");

    for (let buttonIndex = 0; buttonIndex < cancelButtonEles.length; buttonIndex += 1) {

      cancelButtonEles[buttonIndex].addEventListener("click", llm.hideModal);

    }

  }

}());
