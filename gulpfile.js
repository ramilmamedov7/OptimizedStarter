const gulp = require('gulp'),
      browserSync = require('browser-sync'),
      newer = require('gulp-newer'),
      del = require('del'),
      gutil = require('gulp-util'),
      notify = require('gulp-notify'),
      rename = require('gulp-rename'),
      concat = require('gulp-concat'),
      imagemin = require('gulp-imagemin'),
      // HTML
      rigger = require('gulp-rigger'),
      htmlmin = require('gulp-htmlmin'),
      htmlbeautify = require('gulp-html-beautify'),
      // Styles
      sass = require('gulp-sass'),
      cssnano = require('cssnano'),
      autoprefixer = require('autoprefixer'),
      postcss = require('gulp-postcss'),
      uncss = require('postcss-uncss'),
      purify = require('gulp-purifycss'),
      cleanCSS = require('gulp-clean-css'),
      // JavaScripts
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify');

const paths = {
  htmlSrc:        './app/*.html',
  scssSrc:        './app/sass/**/*.scss',
  scriptSrc:      './app/js/core.js',
  imgSrc:         './app/img/**/*.{jpg,jpeg,png,gif,svg}',
  rootFilesSrc:   ['manifest.json', 'favicon.ico', 'browserconfig.xml'],
  fontSrc:        './app/fonts/**/*'
};

//  Task for live reload
//  Live reloading browser when files are modified and keeping multiple browsers & devices in sync while developing.
gulp.task('serve', () => {
  browserSync({
    server: {
      baseDir: './dist'
    },
    notify: false,
    open: false,
    port: 3030,
    // tunnel: true,
    // tunnel: "projectmane", //  Demonstration page: http://projectmane.localtunnel.me
  });
});

//  Task for removing dist folder
gulp.task('clean', next => {
  del.sync('./dist');
  return next();
});

//  Task for HTML files
//  Concatenation partials of HTML file like (Header, Footer) and Minifying-Beautifying them.
gulp.task('html', () => {
  let options = {
    "indent_size": 4,
    "indent_char": " ",
    "eol": "\n",
    "indent_level": 0,
    "indent_with_tabs": false,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "brace_style": "collapse",
    "keep_array_indentation": false,
    "keep_function_indentation": false,
    "space_before_conditional": true,
    "break_chained_methods": false,
    "eval_code": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "wrap_attributes": "auto",
    "wrap_attributes_indent_size": 4,
    "end_with_newline": false
  };
  gulp
    .src(paths.htmlSrc)
    .on('error', message => {
      gutil.log(gutil.colors.red('[Error]'), message.toString());
      notify.onError();
    })
    .pipe(rigger())
    .pipe(htmlbeautify(options))
//  .pipe(htmlmin({ collapseWhitespace: true })) // (Optional)
    .pipe(gulp.dest('./dist/'))
});

//  Task for Images
//  Minifying Images files and putting them into dist directory and clearing gulp paths cashing...
gulp.task('img', () => {
  gulp
    .src(paths.imgSrc)
    .pipe(newer('./dist/img/'))
    .pipe(imagemin([imagemin.svgo({
      plugins: [{
        removeViewBox: true
      }]
    })], {
      verbose: true
    }))
    .pipe(gulp.dest('./dist/img/'));
});

// Task for transferring.
// Transferring root directory files and fonts to production directory...
gulp.task('spit', () => {
  gulp
    .src([
      './app/manifest.json',
      './app/favicon.ico',
      './app/browserconfig.xml'
    ])
    .pipe(gulp.dest('./dist/'));
    Fonts();
});

Fonts = () => {
  return (
    gulp
      .src(paths.fontSrc)
      .pipe(gulp.dest('./dist/fonts/'))
  )
};

//  Task for styles
//  Compiling SASS, cutting unused CSS modules, adding prefixes, minifying and renaming the final file...
gulp.task('style', () => {
  let plugins = [
    autoprefixer({browsers: ['last 5 version']}),
    cssnano({
      safe: true,
      discardComments: false,
      minifyFontValues: false,
    }),
    uncss({
      html: ['./dist/index.html'],
      ignore: ['.fade', '.active']
    }),
  ];
  return (
    gulp
      .src(paths.scssSrc)
      .pipe(sass({ outputStyle: 'expand' }))
      .pipe(purify(['./app/**/*.js', './app/**/*.html']))
      .pipe(cleanCSS({compatibility: "ie8"}))
      .pipe(postcss(plugins))
      .on('error', message => {
        gutil.log(gutil.colors.red('[Error]'), message.toString());
        notify.onError();
      })
      .pipe(rename({ suffix: '.min', prefix: '' }))
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.reload({ stream: true }))
  );
});

//  Task for scripts
//  Transpiling ES6 to ES5 with Babel, concatenating JS vendors, minifying the final file...
gulp.task('script', () => {
  gulp
    .src(paths.scriptSrc)
    .pipe(babel({ presets: ['env'] }))
    .pipe(gulp.dest('./dist/js/'));
    Scripts();
});

Scripts = () => {
  return (
    gulp
      .src([
        './app/libs/jquery/jquery.min.js',
        './app/libs/bootstrap/popper.min.js',
        './app/libs/bootstrap/bootstrap.min.js',
        './app/libs/swiper/swiper.min.js',
        './dist/js/core.js'
      ])
      .pipe(concat('vendors.min.js'))
      .pipe(uglify()) // (Optional)
      .on('error', message => {
        gutil.log(gutil.colors.red('[Error]'), message.toString());
      })
      .pipe(gulp.dest('./dist/js'))
      .pipe(browserSync.reload({ stream: true }))
  )
};

//  Watchers for html, sass, js, image, root-files files...
gulp.task('watch', ['style', 'script', 'html', 'spit', 'img', 'serve'], () => {
  gulp.watch('./app/**/*.html',                       ['html']);
  gulp.watch(paths.scssSrc,                           ['style']);
  gulp.watch(['./app/libs/**/*.js', paths.scriptSrc], ['script']);
  gulp.watch(paths.htmlSrc, browserSync.reload);
});

//  Default task
gulp.task('default', ['watch']);