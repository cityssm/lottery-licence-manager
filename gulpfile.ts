// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, n/no-unpublished-import */

import gulp from 'gulp'
import changed from 'gulp-changed'
import concat from 'gulp-concat'
import minify from 'gulp-minify'
import gulpSass from 'gulp-sass'
import * as dartSass from 'sass'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const sass = gulpSass(dartSass)

/*
 * Compile SASS
 */

const publicSCSSDestination = 'public/stylesheets'

function publicSCSSFunction(): NodeJS.ReadWriteStream {
  return gulp
    .src('public-scss/*.scss')
    .pipe(
      sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }).on(
        'error',
        sass.logError
      )
    )
    .pipe(gulp.dest(publicSCSSDestination))
}

gulp.task('public-scss', publicSCSSFunction)

/*
 * Minify public/javascripts
 */

const publicJavascriptsDestination = 'public/javascripts'

function publicJavascriptsMinFunction(): NodeJS.ReadWriteStream {
  return gulp
    .src('public-typescript/*.js', { allowEmpty: true })
    .pipe(
      changed(publicJavascriptsDestination, {
        extension: '.min.js'
      })
    )
    .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
    .pipe(gulp.dest(publicJavascriptsDestination))
}

function publicJavascriptsLicenceEditFunction(): NodeJS.ReadWriteStream {
  return gulp
    .src(
      [
        'public-typescript/licence-edit/main.js',
        'public-typescript/licence-edit/ticketTypes.js'
      ],
      { allowEmpty: true }
    )
    .pipe(concat('licence-edit.js'))
    .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
    .pipe(gulp.dest('public/javascripts'))
}

gulp.task('public-javascript-min', publicJavascriptsMinFunction)
gulp.task(
  'public-javascript-licence-edit-min',
  publicJavascriptsLicenceEditFunction
)

/*
 * Watch
 */

function watchFunction(): void {
  gulp.watch('public-scss/*.scss', publicSCSSFunction)
  gulp.watch('public-typescript/*.js', publicJavascriptsMinFunction)
  gulp.watch(
    'public-typescript/licence-edit/*.js',
    publicJavascriptsLicenceEditFunction
  )
}

gulp.task('watch', watchFunction)

/*
 * Initialize default
 */

gulp.task('default', () => {
  publicSCSSFunction()
  publicJavascriptsMinFunction()
  watchFunction()
})
