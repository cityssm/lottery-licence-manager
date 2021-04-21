import gulp from "gulp";
import changed from "gulp-changed";
import minify from "gulp-minify";

/*
 * Minify public/javascripts
 */

const publicJavascriptsDest = "public/javascripts";

const publicJavascriptsMinFn = () => {

  return gulp.src("public-typescript/*.js", { allowEmpty: true })
    .pipe(changed(publicJavascriptsDest, {
      extension: ".min.js"
    }))
    .pipe(minify({ noSource: true, ext: { min: ".min.js" } }))
    .pipe(gulp.dest(publicJavascriptsDest));
};


gulp.task("public-javascript-min", publicJavascriptsMinFn);

/*
 * Watch
 */

const watchFn = () => {
  gulp.watch("public-typescript/*.js", publicJavascriptsMinFn);
};

gulp.task("watch", watchFn);

/*
 * Initialize default
 */

gulp.task("default", () => {
  publicJavascriptsMinFn();
  watchFn();
});
