const gulp = require('gulp'),
      browsersync = require('browser-sync'),
      newer = require('gulp-newer'),
      gutil = require('gulp-util'),
      notify = require('gulp-notify'),
      rename = require('gulp-rename'),
      concat = require('gulp-concat'),
      imagemin = require('gulp-imagemin'),
      htmlmin = require('gulp-htmlmin'),
      sass = require('gulp-sass'),
      uncss = require('gulp-uncss'),
      purify = require("gulp-purify-css"),
      cssnano = require('gulp-cssnano'),
      autoprefixer = require('gulp-autoprefixer'),
      cleancss = require('gulp-clean-css'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify');

let paths = {
  sass: 'app/sass/**/*.scss',
  script: 'app/js/core.js',
  imgsrc: 'app/img/**/*',
  imgdest: 'dist/img',
};

//  Task for live reload
//  Live reloading browser when files are modified and keeping multiple browsers & devices in sync while developing.
gulp.task('browser-sync', () => {
  browsersync({
    server: {
      baseDir: 'dist'
    },
    notify: false
    // open: false,
    // tunnel: true,
    // tunnel: "projectmane", //  Demonstration page: http://projectmane.localtunnel.me
  });
});


//  Task for HTML files
//  Minifying HTML files and putting them into dist directory...
gulp.task('html', () => {
  gulp
    .src('app/**.html')
    .pipe(htmlmin({ collapseWhitespace: true })) // (Optional)
    .pipe(gulp.dest('dist'))
    .pipe(browsersync.reload({ stream: true }));
});


//  Task for Images
//  Minifying Images files and putting them into dist directory and clearing gulp paths cashing...
gulp.task('img', () => {
  gulp
    .src(paths.imgsrc)
    .pipe(newer(paths.imgdest))
    .pipe(imagemin([imagemin.svgo({
      plugins: [{
        removeViewBox: true
      }]
    })], {
      verbose: true
    }))
    .pipe(gulp.dest(paths.imgdest));
});


// Task for Fonts
// Transfering fonts to production directory...
gulp.task('fonts', () => {
  gulp
    .src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});


//  Task for styles
//  Compiling SASS, cutting unused CSS modules, adding prefixes, minifying and renaming the final file...
gulp.task('styles', () => {
  return (
    gulp
    .src(paths.sass)
    .pipe(sass({ outputStyle: 'expand' }))
    .on('error', message => {
      gutil.log(gutil.colors.red('[Error]'), message.toString());
      notify.onError();
    })
    .pipe(uncss({ html: ['app/**.html', 'http://localhost:3000'] })) // (Optional)
    .pipe(purify(['app/**/*.js', 'app/**/*.html'])) // (Optional)
    .pipe(cssnano()) // (Optional)
    .pipe(autoprefixer(['last 5 versions'])) // (Optional)
    .pipe(cleancss({level:{1:{specialComments:0}}})) // (Optional)
    .pipe(rename({ suffix: '.min', prefix: '' }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browsersync.reload({ stream: true }))
  );
});

//  Task for scripts
//  Transpiling ES6 to ES5 with Babel, concatenating JS vendors, minifying the final file...
gulp.task('scripts', () => {
  gulp
    .src(paths.script)
    .pipe(babel({ presets: ['env'] }))
    .pipe(gulp.dest('dist/js/'));
    Scripts();
});

Scripts = () => {
  return gulp
    .src([
      'app/libs/jquery/jquery.min.js',
      'app/libs/bootstrap/popper.min.js',
      'app/libs/bootstrap/bootstrap.min.js',
      'app/libs/swiper/swiper.min.js',
      'dist/js/core.js'
    ])
    .pipe(concat('vendors.min.js'))
    .pipe(uglify()) // (Optional)
    .on('error', message => {
      gutil.log(gutil.colors.red('[Error]'), message.toString());
    })
    .pipe(gulp.dest('dist/js'))
    .pipe(browsersync.reload({ stream: true }));
};


//  Watchers for html, sass, js, image, font files...
gulp.task('watch', ['styles', 'scripts', 'html', 'fonts', 'img', 'browser-sync'], () => {
  gulp.watch('app/*.html', ['html']);
  gulp.watch(paths.sass, ['styles']);
  gulp.watch(['app/libs/**/*.js', paths.script], ['scripts']);
  gulp.watch('app/*.html', browsersync.reload);
});


//  Default task
gulp.task('default', ['watch']);