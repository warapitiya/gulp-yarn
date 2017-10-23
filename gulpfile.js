/**
 * Created by mwarapitiya on 10/23/17.
 */

const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('babel', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('lib'));
});

gulp.task('default', ['babel']);
