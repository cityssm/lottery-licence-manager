/* eslint-disable node/no-unpublished-import */

import gulp from "gulp";
import changed from "gulp-changed";
import concat from "gulp-concat";
import minify from "gulp-minify";

/*
 * Minify public/javascripts
 */

const publicJavascriptsDestination = "public/javascripts";

const publicJavascriptsMinFunction = () => {

  return gulp.src("public-typescript/*.js", { allowEmpty: true })
    .pipe(changed(publicJavascriptsDestination, {
      extension: ".min.js"
    }))
    .pipe(minify({ noSource: true, ext: { min: ".min.js" } }))
    .pipe(gulp.dest(publicJavascriptsDestination));
};


const publicJavascriptsLicenceEditFunction = () => {

  return gulp.src([
    "public-typescript/licence-edit/main.js",
    "public-typescript/licence-edit/ticketTypes.js"
  ], { allowEmpty: true })
    .pipe(concat("licence-edit.js"))
    .pipe(minify({ noSource: true, ext: { min: ".min.js" } }))
    .pipe(gulp.dest("public/javascripts"));
};


gulp.task("public-javascript-min", publicJavascriptsMinFunction);
gulp.task("public-javascript-licence-edit-min", publicJavascriptsLicenceEditFunction);

/*
 * Watch
 */

const watchFunction = () => {
  gulp.watch("public-typescript/*.js", publicJavascriptsMinFunction);
  gulp.watch("public-typescript/licence-edit/*.js", publicJavascriptsLicenceEditFunction);
};

gulp.task("watch", watchFunction);

/*
 * Initialize default
 */

gulp.task("default", () => {
  publicJavascriptsMinFunction();
  watchFunction();
});
