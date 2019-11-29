/* global module */


let dateTimeFns = {

  // date

  dateIntegerToString: function(dateInteger) {
    "use strict";

    let dateString = dateInteger.toString();
    return dateString.substring(0, 4) + "-" + dateString.substring(4, 6) + "-" + dateString.substring(6, 8);
  },

  dateToString: function(dateObj) {
    "use strict";
    return dateObj.getFullYear() + "-" +
      ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
      ("0" + (dateObj.getDate())).slice(-2);
  },

  dateToInteger: function(dateObj) {
    "use strict";
    return (dateObj.getFullYear() * 10000) +
      (dateObj.getMonth() * 100) + 100 +
      dateObj.getDate();
  },

  dateStringToInteger: function(dateString) {
    "use strict";
    return parseInt(("0" + dateString).replace(/-/g, ""));
  },

  // time

  timeIntegerToString: function(timeInteger) {
    "use strict";

    let timeString = ("0000" + (timeInteger || 0).toString()).slice(-4);
    return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);
  },

  timeStringToInteger: function(timeString) {
    "use strict";
    return parseInt(("0" + timeString).replace(/:/g, ""));
  }
};

module.exports = dateTimeFns;
