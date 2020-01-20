/* global require, module */
/* global __dirname */

"use strict";

const express = require("express");
const router = express.Router();

const createError = require("http-errors");
const fs = require("fs");
const path = require("path");
const marked = require("marked");


router.all("/", function(req, res) {

  res.redirect("/docs/readme.md");

});


router.all("/:mdFileName", function(req, res, next) {

  const mdFileName = req.params.mdFileName;

  const mdPath = path.join(__dirname, "../docs/" + mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));

  fs.readFile(mdPath, "utf8", function(err, data) {

    if (err) {

      next(createError(400));
      return;

    }

    res.send(`
      <html>
        <head>
          <link rel="stylesheet" href="/stylesheets/docs.min.css" />
        </head>
        <body>
        <article class="markdown-body">` +
      marked(data.toString()) +
      `
        </article>
      </body>
      </html>`
    );

  });

});


module.exports = router;
