const gulp = require('gulp'); //подключаем gulp;
const rigger= require('gulp-rigger'); // склеивает файлы
const minifyCss = require('gulp-minify-css'); //сжимает файлы
const imagemin = require('gulp-imagemin'); //оптимизация изображений
const clean = require('gulp-clean'); //удаляет файл или папку
const shell = require('gulp-shell');//очередность запуска
const browserSync = require ('browser-sync');//локальный сервер
const reload = browserSync.reload; //перезагрузка сервера
const runSequence = require('run-sequence'); //запускает задачи по очереди
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

const path = {
    src: {
        html: ['app/components/**/*.html'],
        styles: ['app/styles/**/*.scss'],
        images: 'app/images/**/*'
    },
    build: {
        scss: 'build/styles/',
        html: 'build',
        images: 'build/images/'
    }
};


gulp.task('sass', function () {
 return gulp.src(path.src.styles)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(minifyCss())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('build/css'))
  .pipe(reload({stream: true}));

});

gulp.task('html', function() {
    return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});



gulp.task('images', function() {
    return gulp.src(path.src.images)
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
             plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ], 
    {
        verbose: true
    }
    )
    )
    .pipe(gulp.dest(path.build.images));
});

gulp.task('clean', function() {
    return gulp.src('build')
      .pipe(clean());
});

gulp.task('build', shell.task([
    'gulp clean',
    'gulp images',
    'gulp html',
    'gulp sass',
    ]) 
);

gulp.task('browser-sync', function() {
    browserSync({
        startPath: "/",
        server: {
            baseDir: "build"
        },
        notify: false
    });
});

gulp.task('server', function() {
    runSequence('build', 'browser-sync', 'watch');
});

gulp.task('watch', function() {
    gulp.watch('app/components/**/*.html', ['html']);
    gulp.watch('app/styles/**/*.scss', ['sass']);
});

gulp.task('default', ['server']);