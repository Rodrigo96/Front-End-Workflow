'use strict';

// Modules
const gulp = require('gulp'),
    less = require('gulp-less'),
    rename = require("gulp-rename"),
    jslint = require('gulp-jslint'),
    uglify = require('gulp-uglify'),
    cmq = require('gulp-combine-mq'),
    csslint = require('gulp-csslint'),
    imagemin = require('gulp-imagemin'),
    lesshint = require('gulp-lesshint'),
    cleancss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();

const cfg = {
  root: 'src',
  build: 'dist',
  src: {
    css: '/css',
    less: '/less',
    js: '/js',
    imgs: '/imgs'
  },
  dist: {
    css: '/css',
    js: '/js',
    imgs: '/imgs'
  }
};

// lint less
gulp.task('lint-less', () => {
  return gulp.src(cfg.root + cfg.src.css + cfg.src.less + '/*.less')
    .pipe(lesshint())
    .pipe(lesshint.reporter())
    .pipe(lesshint.failOnError());
});

// compile less files
gulp.task('compile-less', ['lint-less'],() => {
  return gulp.src(cfg.root + cfg.src.css + cfg.src.less + '/imports.less')
    .pipe(less())
    .pipe(rename("main.css"))
    .pipe(gulp.dest(cfg.root + cfg.src.css));
});

// lint css
gulp.task('lint-css', () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(csslint())
    .pipe(csslint.formatter(
      require('csslint-stylish')));
});

// autoprefix css
gulp.task('prefix-css', ['cmq'], () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(autoprefixer(
      { browsers: ['last 2 versions'] }
    ))
    .pipe(gulp.dest(cfg.root + cfg.src.css));
});

gulp.task('cmq', ['compile-less'], () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(
      cmq(
        { beautify: true }))
    .pipe(gulp.dest(cfg.root + cfg.src.css));
})

// lint js
gulp.task('lint-js', () => {
  return gulp.src(cfg.root + cfg.src.js + '/main.js')
    .pipe(jslint({
      "devel": true,
       "browser": true
    }))
    .pipe(
      jslint.reporter('stylish'));
});

// watch files
gulp.task('watch', ['serve'], () => {
  gulp.watch([
    cfg.root + cfg.src.css + cfg.src.less + '/*.less',
    cfg.root + cfg.src.js + '/main.js',
    cfg.root + '/*.html'
    ], ['css', 'js', 'reload']);
})

// reload browser
gulp.task('reload', ['css', 'js'], () => {
  browserSync.reload();
});

// create server
gulp.task('serve', () => {
  browserSync.init({
        server: {
          baseDir: cfg.root + '/',
        }
      });
});

gulp.task('copy-to-dist', () => {
  return gulp.src(cfg.root + '/*.html')
    .pipe(gulp.dest(cfg.build + '/'));
})

gulp.task('minify-js', () => {
  return gulp.src(cfg.root + cfg.src.js + '/main.js')
    .pipe(uglify())
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.js));
});

gulp.task('minify-css', () => {
  return gulp.src(cfg.root + cfg.src.css + '/main.css')
    .pipe(cleancss({debug: true}, details => {
            console.log('Normal ' + details.name + ': ' + details.stats.originalSize + ' bytes');
            console.log('Minified ' + details.name + ': ' + details.stats.minifiedSize + ' bytes');
        }))
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.css));
});

gulp.task('minify-imgs', () => {
  return gulp.src(cfg.root + cfg.src.imgs + '/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest(cfg.build + '/' + cfg.dist.imgs));
})

gulp.task('default', ['css', 'js']);

gulp.task('server', ['serve', 'watch'])

gulp.task('css', ['lint-less', 'compile-less', 'cmq', 'prefix-css']);

gulp.task('js', ['lint-js']);

gulp.task('dist', ['copy-to-dist', 'minify-js', 'minify-css', 'minify-imgs']);