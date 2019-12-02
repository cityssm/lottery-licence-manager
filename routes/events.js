/* global require, module */

const express = require("express");
const router = express.Router();

const licencesDB = require("../helpers/licencesDB");



router.get("/", function(req, res) {
  "use strict";

  const dateTimeFns = require("../helpers/dateTimeFns");

  res.render("event-search", {
    dateTimeFns: dateTimeFns
  });
});


router.get("/doSearch", function(req, res) {
  "use strict";
  res.json(licencesDB.getEvents(req.body.year, req.body.month, true));
});

module.exports = router;
