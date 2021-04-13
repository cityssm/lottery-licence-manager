"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const createError = require("http-errors");
const fs = require("fs");
const path = require("path");
const marked = require("marked");
const sanitize = require("sanitize-filename");
const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const applicationName = configFns.getProperty("application.applicationName");
const handler = (req, res, next) => {
    const mdFileName = sanitize(req.params.mdFileName);
    const mdPath = path.join(__dirname, "..", "..", "docs", mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));
    fs.readFile(mdPath, "utf8", (err, data) => {
        if (err) {
            next(createError(400));
            return;
        }
        res.send(`<html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Help: ${applicationName}</title>
        <link rel="icon" href="${urlPrefix}/images/favicon.png" />
        <link rel="stylesheet" href="${urlPrefix}/stylesheets/docs.min.css" />
      </head>
      <body>
      <article class="markdown-body">` +
            marked(data.toString()) +
            `
      </article>
      </body>
      </html>`);
    });
};
exports.handler = handler;
