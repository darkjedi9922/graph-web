var gulp = require('gulp');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var minifyCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');

// ==== Styles ====

const scssBlobs = [
    'styles/*.scss',
    'styles/*/*.scss',
    'styles/*/*/*.scss'
]

gulp.task('scss', function() {
    return gulp.src(scssBlobs)
        .pipe(sass())

        // Именно minifyCss нормально обрабатывает @import в файлах, а не sass.
        .pipe(minifyCss())

        .pipe(autoprefixer())
        .pipe(gulp.dest('assets'));
});

gulp.task('watch-scss', () => {
    return gulp.watch(scssBlobs, gulp.task('scss'))
})

// ==== Babel ====

const babelBlobs = [
    'scripts/*.js',
    'scripts/*/*.js'
]

gulp.task('babel', () => {
    return gulp.src(babelBlobs)
        .pipe(babel({
            presets: ['@babel/env', '@babel/react']
        }))
        .pipe(concat('babel.js'))
        .pipe(gulp.dest('assets'));
})

gulp.task('watch-babel', () => {
    return gulp.watch(babelBlobs, gulp.parallel('babel'))
});

// ==== Default ====

gulp.task('default', gulp.parallel('scss', 'babel'));
gulp.task('watch', gulp.parallel('watch-scss', 'watch-babel'))