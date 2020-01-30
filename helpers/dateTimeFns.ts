"use strict";


const dateTimeFns = {

  /*
   * Date Functions
   */

  dateIntegerToString: function(dateInteger: number) : string {

    if (dateInteger === null || dateInteger === 0) {
      return "";
    }

    const dateString = dateInteger.toString();
    return dateString.substring(0, 4) + "-" + dateString.substring(4, 6) + "-" + dateString.substring(6, 8);

  },

  dateToString: function(dateObj : Date) : string {

    return dateObj.getFullYear() + "-" +
      ("0" + (dateObj.getMonth() + 1)).slice(-2) + "-" +
      ("0" + (dateObj.getDate())).slice(-2);

  },

  dateToInteger: function(dateObj : Date) : number {

    return (dateObj.getFullYear() * 10000) +
      (dateObj.getMonth() * 100) + 100 +
      dateObj.getDate();

  },

  dateStringToInteger: function(dateString : string) : number {

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

  timeIntegerToString: function(timeInteger : number) : string {

    const timeString = ("0000" + (timeInteger || 0).toString()).slice(-4);
    return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);

  },

  timeStringToInteger: function(timeString : string) : number {

    return parseInt(("0" + timeString).replace(/:/g, ""));

  },

  dateToTimeInteger: function(dateObj : Date) : number {
    return (dateObj.getHours() * 100) + dateObj.getMinutes();
  }
};


export = dateTimeFns;
