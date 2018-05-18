const gulp = require('gulp'),
      browsersync = require('browser-sync'),
      sass = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      cleancss = require('gulp-clean-css'),
      uncss = require('gulp-uncss'),
      imagemin = require('gulp-imagemin'),
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

//Task for styles
gulp.task('styles', () => {
  return (
    gulp
      .src('app/sass/**/*.scss')
      .pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
      .pipe(uncss({html: ['app/index.html', 'app/**/*.html', 'http://localhost:3000']})) // (Opt.)
      .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // (Opt.)
      .pipe(autoprefixer(['last 10 versions']))
      .pipe(rename({ suffix: '.min', prefix: '' }))
      .pipe(gulp.dest('app/css'))
      .pipe(browsersync.reload({ stream: true }))
  );
});

//Task for images
gulp.task('images', () => {
  gulp
    .src('app/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('app/img'));
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
