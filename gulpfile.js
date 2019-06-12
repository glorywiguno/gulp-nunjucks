/**
 * gulp configuration
 *
 */
'use strict';

const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const del = require('del');
// const autoprefixer = require('autoprefixer');

var browserSync = require('browser-sync');

/** root for source codes */
const srcRoot = './src';
/** root for compiled assets and code */
const destRoot = './build';

/** path definitions */
const paths = {
  src: {
    scripts: `${srcRoot}/scripts/**/*.js`,
    styles: `${srcRoot}/styles/**/*.scss`,
    templates: `${srcRoot}/templates/**/*.html`,
    assets: `${srcRoot}/assets/**/*.{jpg, png, gif}`,
  },
  dest: {
    scripts: `${destRoot}/scripts/`,
    styles: `${destRoot}/styles/`,
    templates: `${destRoot}`,
    assets: `${destRoot}/assets/`,
  },
};







/**
 * @name isProduction
 * @function
 *   helper function that returns boolean value indicating if the
 *   current node environment for the process is production
 * @return boolean value
 */
function isProduction() {
  return process.env.NODE_ENV === "production";
}


/**
 * @name isDevelopment
 * @function
 *   helper function that returns boolean value indicating if the
 *   current node environment for the process is development
 * @return boolean value
 */
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}


/**
 * @name initServer
 * @function
 *   initializes the server
 * @param cb {function} a callback function
 *
 */
function initServer(cb) {
  browserSync = browserSync.create();

  cb();
}


/**
 * @name compileStyles
 * @function
 *   compile scss files
 * @param cb {function} a callback function
 * @return a stream object
 */
function compileStyles(cb) {
  const sassConfigs = {
    outputStyle: 'expanded',
  };

  if (isProduction()) {
    sassConfigs.outputStyle = 'compressed'
  }

  return gulp.src(paths.src.styles)
    .pipe(sass(sassConfigs).on('error', sass.logError))
    .pipe(gulp.dest(paths.dest.styles));
}


/**
 * @name compileScripts
 * @function 
 *   compile javascript file
 * @param cb {function} callback function
 * @return
 */
function compileScripts(cb) {
  return gulp.src()
}


/**
 * @name compileTemplate
 * @function
 *   compile template files
 * @param cb {function} a callback function
 * @return a stream object
 */
function compileTemplates(cb) {
  return gulp.src(paths.src.templates)
    .pipe(gulp.dest(paths.dest.templates));
}


/**
 * @name watchTemplates
 * @function 
 *   watch the changes happening for template files
 * @param cb {function} callback function
 * @return
 */
function watchTemplates(cb) {
  return gulp.src(paths.src.templates)
}


/**
 * @name watchStyles
 * @function 
 *   watch the changes happening for scss files
 * @param cb {function} callback function
 * @return
 */
function watchStyles(cb) {
  return gulp.src(paths.src.styles)
}


/**
 * @name watchScripts
 * @function 
 *   watch the changes happening for javascript files
 * @param cb {function} callback function
 * @return
 */
function watchScripts(cb) {
  return gulp.src(paths.src.scripts)
}


/**
 * @name clean
 * @param cb {function} callback function
 * @function
 *   deletes the build folder
 */
function clean(cb) {
  return del(destRoot);
}



/**
 * define gulp tasks
 */
module.exports = {
  style: compileStyles,
  template: compileTemplates,
  clean: clean,
}


