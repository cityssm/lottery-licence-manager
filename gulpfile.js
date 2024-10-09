import gulp from 'gulp';
import changed from 'gulp-changed';
import concat from 'gulp-concat';
import minify from 'gulp-minify';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
const publicSCSSDestination = 'public/stylesheets';
function publicSCSSFunction() {
    return gulp
        .src('public-scss/*.scss')
        .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }).on('error', sass.logError))
        .pipe(gulp.dest(publicSCSSDestination));
}
gulp.task('public-scss', publicSCSSFunction);
const publicJavascriptsDestination = 'public/javascripts';
function publicJavascriptsMinFunction() {
    return gulp
        .src('public-typescript/*.js', { allowEmpty: true })
        .pipe(changed(publicJavascriptsDestination, {
        extension: '.min.js'
    }))
        .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
        .pipe(gulp.dest(publicJavascriptsDestination));
}
function publicJavascriptsLicenceEditFunction() {
    return gulp
        .src([
        'public-typescript/licence-edit/main.js',
        'public-typescript/licence-edit/ticketTypes.js'
    ], { allowEmpty: true })
        .pipe(concat('licence-edit.js'))
        .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
        .pipe(gulp.dest('public/javascripts'));
}
gulp.task('public-javascript-min', publicJavascriptsMinFunction);
gulp.task('public-javascript-licence-edit-min', publicJavascriptsLicenceEditFunction);
function watchFunction() {
    gulp.watch('public-scss/*.scss', publicSCSSFunction);
    gulp.watch('public-typescript/*.js', publicJavascriptsMinFunction);
    gulp.watch('public-typescript/licence-edit/*.js', publicJavascriptsLicenceEditFunction);
}
gulp.task('watch', watchFunction);
gulp.task('default', () => {
    publicSCSSFunction();
    publicJavascriptsMinFunction();
    watchFunction();
});
