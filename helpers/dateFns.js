/* global module */


let dateFns = {

  integerToString: function(dateInteger) {
    "use strict";

    let dateString = dateInteger.toString();
    return dateString.substring(0, 4) + "/" + dateString.substring(4, 6) + "/" + dateString.substring(6, 8);
  },

  dateToString: function(dateObj) {
    "use strict";
    return dateObj.getFullYear() + "/" +
      ("0" + (dateObj.getMonth() + 1)).slice(-2) + "/" +
      ("0" + (dateObj.getDate())).slice(-2);
  }
};

module.exports = dateFns;
