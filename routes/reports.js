/* global require, module */

const express = require("express");
const router = express.Router();

router.get("/", function(req, res) {
  "use strict";

  res.render("reports", req.session);
});

module.exports = router;
