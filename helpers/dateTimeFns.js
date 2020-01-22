/* global module */

"use strict";


const dateTimeFns = {

  /*
   * Date Functions
   */

  // 20200131 -> "2020-01-31"
  dateIntegerToString: function(dateInteger) {

    if (dateInteger === null || dateInteger === 0) {

      return "";

    }

    const dateString = dateInteger.toString();
    return dateString.substring(0, 4) + "-" + dateString.substring(4, 6) + "-" + dateString.substring(6, 8);

  },

  // Date() -> "2020-01-31"
  dateToString: function(dateObj) {

    return dateObj.getFullYear() + "-" +
      ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
      ("0" + (dateObj.getDate())).slice(-2);

  },

  // Date() -> 20200131
  dateToInteger: function(dateObj) {

    return (dateObj.getFullYear() * 10000) +
      (dateObj.getMonth() * 100) + 100 +
      dateObj.getDate();

  },

  // "2020-01-31" -> 20200131
  dateStringToInteger: function(dateString) {

    return parseInt(("0" + dateString).replace(/-/g, ""));

  },

  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],

  /*
   * Time Functions
   */

  // 1402 -> "14:02"
  timeIntegerToString: function(timeInteger) {

    const timeString = ("0000" + (timeInteger || 0).toString()).slice(-4);
    return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);

  },

  // "14:02" -> 1402
  timeStringToInteger: function(timeString) {

    return parseInt(("0" + timeString).replace(/:/g, ""));

  },

  // Date() -> 1402
  dateToTimeInteger: function(dateObj) {

    return (dateObj.getHours() * 100) + dateObj.getMinutes();

  }
};


module.exports = dateTimeFns;
