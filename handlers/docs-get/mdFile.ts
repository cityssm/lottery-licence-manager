import type { RequestHandler } from "express";

import * as configFns from "../../helpers/configFns.js";

import createError from "http-errors";
import * as fs from "fs";
import * as path from "path";
import marked from "marked";

import sanitizeFilename from "sanitize-filename";


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
const applicationName = configFns.getProperty("application.applicationName");


export const handler: RequestHandler = (req, res, next) => {

  const mdFileName = sanitizeFilename(req.params.mdFileName);

  const mdPath = path.join(__dirname, "..", "..", "docs",
    mdFileName + (mdFileName.endsWith(".md") ? "" : ".md"));

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
