var gulp = require("gulp"),
    gutil = require("gulp-util"),
    sass = require("gulp-sass"),
    browsersync = require("browser-sync"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    cleancss = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    autoprefixer = require("gulp-autoprefixer"),
    notify = require("gulp-notify");

gulp.task("browser-sync", function() {
  browsersync({
    server: {
      baseDir: "app"
    },
    notify: false
    // open: false,
    // tunnel: true,
    // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
  });
});

gulp.task("styles", function() {
  return gulp
    .src("app/sass/**/*.scss")
    .pipe(sass({ outputStyle: "expand" }).on("error", notify.onError()))
    .pipe(autoprefixer(["last 10 versions"]))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    //.pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    .pipe(gulp.dest("app/css"))
    .pipe(browsersync.reload({ stream: true }));
});

gulp.task("js", function() {
  return (
    gulp
      .src([
        "app/libs/jquery/dist/jquery.min.js",
        "app/js/core.js" // Always at the end
      ])
      .pipe(concat("scripts.min.js"))
      // .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest("app/js"))
      .pipe(browsersync.reload({ stream: true }))
  );
});

gulp.task("watch", ["styles", "js", "browser-sync"], function() {
  gulp.watch("app/sass/**/*.scss", ["styles"]);
  gulp.watch(["libs/**/*.js", "app/js/core.js"], ["js"]);
  gulp.watch("app/*.html", browsersync.reload);
});

gulp.task("default", ["watch"]);
