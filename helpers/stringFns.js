/* global module */


let stringFns = {

  escapeHTML: function(str) {
    "use strict";

    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
};

module.exports = stringFns;
