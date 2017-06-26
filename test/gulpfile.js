'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')

require('dotenv').config({path: `${__dirname}/.env`, silent: true})

function exitWithError () {
  console.log(arguments)
  process.exit(-1)
}

gulp.task('unit-tests', function () {
  return gulp.src(`${__dirname}/tests/unit/**.js`, {read: false})
    .pipe(mocha())
    .once('error', exitWithError)
})

gulp.task('test', ['unit-tests'])
