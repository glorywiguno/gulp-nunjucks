/**
 * gulp configuration
 *
 */
'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const nunjucks = require('gulp-nunjucks');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');
const plumber = require('gulp-plumber');

const nunjucksCore = require('nunjucks');
const del = require('del');
const autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync');



// to specify where nunjucks should get the template
// https://mozilla.github.io/nunjucks/api.html#loader
const nunjucksEnv = new nunjucksCore.Environment(new nunjucksCore.FileSystemLoader('src/templates', { noCache: true, }), { noCache: true, });
/** nunjucks options */
const nunjucksOptions = {
  env: nunjucksEnv,
}

/** sass configurations */
const sassConfigs = {
  outputStyle: 'expanded',
};

/** postcss plugins */
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
    templates: `${srcRoot}/templates/pages/**/*.html`,
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
  // return mode === "production";
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
  // return mode === "development";
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
      .pipe(plumber())
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
    stream = stream
      .pipe(sass(sassConfigs).on('error', sass.logError))
      .pipe(postcss(postcssPlugins))
      .pipe(gulp.dest(paths.dest.styles))
      .pipe(browserSync.stream());
  }


  return stream;
}

function compileVendorsScripts(cb) {
  return gulp.src(`${paths.src.scripts}vendors/*.js`)
    .pipe(plumber())
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(paths.dest.scripts));
}


function compileComponentScripts(cb) {
  let webpackConfig;
  if (isProduction()) {
    webpackConfig = require('./webpack/config.production.js');
  }
  else {
    webpackConfig = require('./webpack/config.development.js');
  }

  return gulp.src(`${paths.src.scripts}bundle.js`)
    .pipe(plumber())
    .pipe(named())
    .pipe(webpackStream(webpackConfig))
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
function compileScripts() {
  let tasks = gulp.series(
    compileVendorsScripts,
    compileComponentScripts
  );

  return tasks;
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
    .pipe(plumber())
    .pipe(nunjucks.compile(null, nunjucksOptions))
    .pipe(rename({ dirname:'/' }))
    .pipe(gulp.dest(paths.dest.templates))
    .pipe(browserSync.stream())
    ;
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

  // watch styles
  gulp.watch(paths.src.styles, compileStyles);
  gulp.watch(`${srcRoot}/templates/**/*.scss`, compileStyles);
  // watch scripts
  gulp.watch(`${paths.src.scripts}vendors`, compileVendorsScripts).on('change', browserSync.reload);
  gulp.watch(`${srcRoot}/templates/**/*.js`, compileComponentScripts).on('change', browserSync.reload);
  gulp.watch(`${paths.src.scripts}*.js`, compileComponentScripts).on('change', browserSync.reload);
  // watch templates
  gulp.watch(`${srcRoot}/templates/**/*.html`, compileTemplates).on('change', browserSync.reload);

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

  tasks = gulp.series(
    clean,
    (cb) => { process.env.NODE_ENV = 'development'; cb();},
    gulp.parallel(
      compileTemplates,
      compileScripts(),
      compileStyles
    ),
    watch
  );

  return tasks;
}

function buildTask() {
  let tasks;

  tasks = gulp.series(
    clean,
    (cb) => { process.env.NODE_ENV = 'production'; cb();},
    gulp.parallel(
      compileTemplates,
      compileScripts(),
      compileStyles
    )
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
  build: buildTask(),
}


