/**
 * gulp configuration
 *
 */
'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const nunjucks = require('gulp-nunjucks');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const del = require('del');
const autoprefixer = require('autoprefixer');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');

var browserSync = require('browser-sync');

const sassConfigs = {
  outputStyle: 'expanded',
};

const postcssPlugins = [
  autoprefixer()
];

/** root for source codes */
const srcRoot = './src';
/** root for compiled assets and code */
const destRoot = './build';

/** path definitions */
const paths = {
  src: {
    scripts: `${srcRoot}/scripts/`,
    styles: `${srcRoot}/styles/**/*.scss`,
    templates: `${srcRoot}/templates/pages/*.html`,
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
 * @name compileStyles
 * @function
 *   compile scss files
 * @param cb {function} a callback function
 * @return a stream object
 */
function compileStyles(cb) {
  let stream = gulp.src(paths.src.styles)
      .pipe(sassGlob());


  if (isProduction()) {
    sassConfigs.outputStyle = 'compressed'

    stream = stream
      .pipe(sass(sassConfigs).on('error', sass.logError))
      .pipe(postcss(postcssPlugins))
      .pipe(gulp.dest(paths.dest.styles));
  }
  else if (!isProduction() && !isDevelopment()) {
    stream = stream
      .pipe(sass(sassConfigs).on('error', sass.logError))
      .pipe(postcss(postcssPlugins))
      .pipe(gulp.dest(paths.dest.styles))
  }
  else {
    console.log('should stream changes')
    stream = stream
      .pipe(sass(sassConfigs).on('error', sass.logError))
      .pipe(postcss(postcssPlugins))
      .pipe(gulp.dest(paths.dest.styles))
      .pipe(browserSync.stream());
  }


  return stream;
}

function compileDependencyScripts(cb) {
  return gulp.src(`${paths.src.scripts}dependencies/*.js`)
    .pipe(concat('dependencies.js'))
    .pipe(gulp.dest(paths.dest.scripts));
}

function compileComponentScripts(cb) {
  // return gulp.src(`${srcRoot}/templates/**/*.js`)
  return gulp.src(`${paths.src.scripts}bundle.js`)
    .pipe(named())
    .pipe(webpackStream())
    .pipe(babel({
      presets: [
        ['@babel/env', {
          modules: 'auto'
        }]
      ]
    }))
    .pipe(gulp.dest(paths.dest.scripts));
}

/**
 * @name compileScripts
 * @function 
 *   compile javascript file
 * @param cb {function} callback function
 * @return
 */
function compileScripts(cb) {
  let tasks = gulp.series(
    compileDependencyScripts,
    compileComponentScripts
  );
  
  return tasks;
  // return gulp.src(paths.src.scripts)
  //   .pipe(gulp.dest(paths.dest.scripts));
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
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(paths.dest.templates));
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
 * @name watch
 * @function
 *   watches the change
 * @param cb {function} a callback function
 *
 */
function watch(cb) {
  browserSync = browserSync.create();
  browserSync.init({
    server: {
      baseDir: './build',
      directory: true,
    },
    ui: {
      port: 9042,
    },
    open: true,
    ghostMode:false,
    port: 8042,
  });
  
  gulp.watch(paths.src.styles, compileStyles);
  gulp.watch(paths.dest.scripts).on('change', browserSync.reload);
  gulp.watch(paths.dest.templates).on('change', browserSync.reload);

  cb();
}


/**
 * @name developTask
 * @function
 *   function defining the development task for gulp
 * @return gulp task stream
 */
function developTask() {
  let tasks;

  process.env.NODE_ENV === 'development';

  tasks = gulp.series(
    clean, 
    gulp.parallel(
      compileTemplates, 
      compileScripts,
      compileStyles
    ),
    watch
  );

  return tasks;
}


/**
 * define gulp tasks
 */
module.exports = {
  style: compileStyles,
  template: compileTemplates,
  scripts: compileScripts(),
  watch: watch,
  clean: clean,
  develop: developTask(),
  default: developTask(),
}


