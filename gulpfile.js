const gulp = require('gulp'),
      browsersync = require('browser-sync'),
      sass = require('gulp-sass'),
      uncss = require('gulp-uncss'),
      purify = require("gulp-purify-css"),
      cssnano = require('gulp-cssnano'),
      autoprefixer = require('gulp-autoprefixer'),
      cleancss = require('gulp-clean-css'),
      imagemin = require('gulp-imagemin'),
      htmlmin = require('gulp-htmlmin');
      babel = require('gulp-babel'),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify'),
      rename = require('gulp-rename'),
      notify = require('gulp-notify');

//Live Server
gulp.task('browser-sync', () => {
  browsersync({
    server: {
      baseDir: 'app'
    },
    notify: false
    // open: false,
    // tunnel: true,
    // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
  });
});

// HTML Minify
gulp.task('minify', () => {
  return gulp.src('app/**.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('app'));
});

//Task for images
gulp.task('images', () => {
  gulp
    .src('app/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('app/img'));
});

// Babel
gulp.task('es6', () => {
  return gulp
  .src('app/js/init.js')
  .pipe(babel({presets: ['env']}))
  .pipe(rename('core.js'))
  .pipe(gulp.dest('app/js/'))
})

//Task for styles
gulp.task('styles', () => {
  return (
    gulp
      .src('app/sass/**/*.scss')
      .pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
      .pipe(uncss({html: ['app/**.html', 'http://localhost:3000']})) // (Opt.)
      .pipe(purify(['app/**/*.js', 'app/**/*.html']))
      .pipe(cssnano())
      .pipe(autoprefixer(['last 5 versions']))
      .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // (Opt.)
      .pipe(rename({ suffix: '.min', prefix: '' }))
      .pipe(gulp.dest('app/css'))
      .pipe(browsersync.reload({ stream: true }))
  );
});

//Task for scripts
gulp.task('scripts', () => {
  return gulp
    .src([
      'app/libs/jquery/jquery.min.js',
      'app/libs/bootstrap/popper.min.js',
      'app/libs/bootstrap/bootstrap.min.js',
      'app/libs/swiper/swiper.min.js',
      'app/js/core.js' // Always at the end
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify()) // (Opt.)
    .pipe(gulp.dest('app/js'))
    .pipe(browsersync.reload({ stream: true }));
});

//Watch
gulp.task('watch', ['styles', 'images', 'scripts', 'browser-sync'], () => {
  gulp.watch('app/sass/**/*.scss', ['styles']);
  gulp.watch(['libs/**/*.js', 'app/js/core.js'], ['scripts']);
  gulp.watch('app/*.html', browsersync.reload);
});

gulp.task('default', ['watch']);