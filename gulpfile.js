import gulp from "gulp";
import changed from "gulp-changed";
import minify from "gulp-minify";
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
const watchFn = () => {
    gulp.watch("public-typescript/*.js", publicJavascriptsMinFn);
};
gulp.task("watch", watchFn);
gulp.task("default", () => {
    publicJavascriptsMinFn();
    watchFn();
});
