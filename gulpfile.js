var gulp = require('gulp');
//ar sass = require('gulp-sass');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
//var minifyCss = require('gulp-clean-css');
//var autoprefixer = require('gulp-autoprefixer');

// const scssBlobs = [
//     'styles/*.scss',
//     'styles/*/*.scss',
//     'styles/*/*/*.scss'
// ]

// gulp.task('scss', function() {
//     return gulp.src(scssBlobs)
//         .pipe(sass())
//         .pipe(minifyCss())
//         .pipe(autoprefixer())
//         .pipe(gulp.dest('assets/styles'));
// });

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

gulp.task('default', gulp.parallel('watch-babel'));