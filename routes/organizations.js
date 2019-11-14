/* global require, module */


const express = require("express");
const router = express.Router();

const dbInit = require("../helpers/dbInit");
const licencesDB = require("better-sqlite3")("data/licences.db");



router.get("/", function(req, res) {
  "use strict";

  dbInit.initLicencesDB(req.session);

  res.render("organization-search", req.session);
});

module.exports = router;
